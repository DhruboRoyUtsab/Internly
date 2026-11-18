import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity.js';
import { StripeEvent } from './entities/stripe-event.entity.js';
import { Subscription } from '../subscriptions/entities/subscription.entity.js';
import { PremiumPlan } from '../subscriptions/entities/premium-plan.entity.js';
import { User } from '../users/entities/user.entity.js';
import { StripeService } from './stripe.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { PaymentStatus } from '../common/enums/payment-status.enum.js';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';
import { QueryPaymentsDto } from './dto/query-payments.dto.js';
import { RefundPaymentDto } from './dto/refund-payment.dto.js';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(StripeEvent)
    private readonly stripeEventRepository: Repository<StripeEvent>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(PremiumPlan)
    private readonly planRepository: Repository<PremiumPlan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly stripeService: StripeService,
    private readonly auditLogsService: AuditLogsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 1. Create a Stripe Checkout Session for student subscription
   */
  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<{ sessionId: string; url: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    // Business rule: Unverified students cannot subscribe
    if (!user.emailVerified) {
      throw new BadRequestException(
        'Email verification required before subscribing to Premium.',
      );
    }

    const plan = await this.planRepository.findOne({ where: { id: dto.planId, isActive: true } });
    if (!plan) {
      throw new NotFoundException(`Active premium plan with ID "${dto.planId}" not found.`);
    }

    const successUrl = dto.successUrl ?? 'http://localhost:5173/payment/success';
    const cancelUrl = dto.cancelUrl ?? 'http://localhost:5173/payment/cancel';

    return await this.stripeService.createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      planId: plan.id,
      planName: plan.name,
      price: Number(plan.price),
      currency: plan.currency,
      successUrl,
      cancelUrl,
    });
  }

  /**
   * 1.5 Built-In 1-Click Demo Payment System (Simulates $4.99 payment without needing real Stripe keys)
   * Runs the exact multi-table transaction:
   * Updates Subscription -> Creates Payment -> Writes stripe_events idempotency record -> Writes AuditLog
   */
  async processDemoPayment(
    userId: string,
    dto: { planId?: string },
  ): Promise<{
    success: boolean;
    message: string;
    subscription: Subscription;
    payment: Payment;
  }> {
    let user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      user = this.userRepository.create({
        id: userId,
        email: 'student@internly.edu',
        fullName: 'Demo Student',
        role: 'STUDENT',
        emailVerified: true,
      });
      await this.userRepository.save(user);
    }

    let plan: PremiumPlan | null = null;
    if (dto.planId) {
      plan = await this.planRepository.findOne({ where: { id: dto.planId } });
    }
    if (!plan) {
      plan = await this.planRepository.findOne({ where: { name: 'Premium Student Plan' } });
    }
    if (!plan) {
      plan = await this.planRepository.findOne({ where: { isActive: true } });
    }
    if (!plan) {
      throw new NotFoundException('No active Premium plan found in database.');
    }

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subscription = await queryRunner.manager.findOne(Subscription, {
        where: { userId: user.id },
      });

      const oldStatus = subscription?.status ?? null;
      const demoSubId = `sub_demo_${Date.now()}`;
      const demoSessionId = `cs_demo_${Date.now()}`;
      const demoPaymentIntentId = `pi_demo_${Date.now()}`;
      const demoEventId = `evt_demo_${Date.now()}`;

      if (!subscription) {
        subscription = queryRunner.manager.create(Subscription, {
          userId: user.id,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          stripeSubscriptionId: demoSubId,
          stripeCustomerId: `cus_demo_${user.id.slice(0, 8)}`,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        });
      } else {
        subscription.planId = plan.id;
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.stripeSubscriptionId = subscription.stripeSubscriptionId ?? demoSubId;
        subscription.currentPeriodStart = now;
        subscription.currentPeriodEnd = periodEnd;
        subscription.cancelAtPeriodEnd = false;
        subscription.canceledAt = null;
      }

      subscription = await queryRunner.manager.save(subscription);

      const payment = queryRunner.manager.create(Payment, {
        userId: user.id,
        subscriptionId: subscription.id,
        amount: Number(plan.price),
        currency: plan.currency,
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: demoPaymentIntentId,
        stripeCheckoutSessionId: demoSessionId,
        paymentMethod: 'card (demo simulation)',
        receiptUrl: `https://internly.test/receipts/${demoPaymentIntentId}`,
      });

      const savedPayment = await queryRunner.manager.save(payment);

      const stripeEvent = queryRunner.manager.create(StripeEvent, {
        id: demoEventId,
        type: 'checkout.session.completed',
        status: 'PROCESSED',
        payload: {
          id: demoEventId,
          type: 'checkout.session.completed',
          simulation: true,
          amount: Number(plan.price),
          userId: user.id,
          planId: plan.id,
        },
        processedAt: now,
      });

      await queryRunner.manager.save(stripeEvent);

      await this.auditLogsService.log({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: 'STUDENT',
        action: 'DEMO_SUBSCRIPTION_ACTIVATED',
        entityName: 'Subscription',
        entityId: subscription.id,
        oldValues: { status: oldStatus },
        newValues: {
          status: SubscriptionStatus.ACTIVE,
          planId: plan.id,
          price: plan.price,
          periodEnd,
        },
      });

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Demo payment completed successfully! Premium subscription is now ACTIVE for 30 days.',
        subscription,
        payment: savedPayment,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 2. Webhook Processor with Idempotency & Database Transaction
   */
  async handleWebhook(rawBody: Buffer | string, signature: string): Promise<{ received: boolean; message?: string }> {
    const event = this.stripeService.constructWebhookEvent(rawBody, signature);
    const eventId = event.id;

    // --- IDEMPOTENCY CHECK ---
    const existingEvent = await this.stripeEventRepository.findOne({ where: { id: eventId } });
    if (existingEvent && existingEvent.status === 'PROCESSED') {
      this.logger.log(`Stripe event ${eventId} already processed. Skipping (Idempotent).`);
      return { received: true, message: 'Event already processed' };
    }

    // Record incoming event
    let recordedEvent = existingEvent;
    if (!recordedEvent) {
      recordedEvent = this.stripeEventRepository.create({
        id: eventId,
        type: event.type,
        status: 'PENDING',
        payload: event as any,
      });
      await this.stripeEventRepository.save(recordedEvent);
    }

    // Process event inside a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.processCheckoutSessionCompleted(session, queryRunner);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.processInvoicePaymentSucceeded(invoice, queryRunner);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.processInvoicePaymentFailed(invoice, queryRunner);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.processSubscriptionDeleted(subscription, queryRunner);
          break;
        }

        default:
          this.logger.log(`Unhandled Stripe event type: ${event.type}`);
      }

      // Mark event as PROCESSED
      recordedEvent.status = 'PROCESSED';
      recordedEvent.processedAt = new Date();
      await queryRunner.manager.save(recordedEvent);

      await queryRunner.commitTransaction();
      return { received: true };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      recordedEvent.status = 'FAILED';
      recordedEvent.errorMessage = err.message;
      await this.stripeEventRepository.save(recordedEvent);

      this.logger.error(`Error processing Stripe event ${eventId}: ${err.message}`);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async processCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    queryRunner: any,
  ) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) {
      this.logger.warn(`Checkout session ${session.id} missing userId or planId in metadata.`);
      return;
    }

    const plan = await queryRunner.manager.findOne(PremiumPlan, { where: { id: planId } });
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // 1. Create or update Subscription to ACTIVE
    let subscription = await queryRunner.manager.findOne(Subscription, {
      where: { userId },
    });

    const oldStatus = subscription?.status ?? null;

    if (!subscription) {
      subscription = queryRunner.manager.create(Subscription, {
        userId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: (session.subscription as string) ?? null,
        stripeCustomerId: (session.customer as string) ?? null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
    } else {
      subscription.planId = planId;
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.stripeSubscriptionId = (session.subscription as string) ?? subscription.stripeSubscriptionId;
      subscription.stripeCustomerId = (session.customer as string) ?? subscription.stripeCustomerId;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
      subscription.canceledAt = null;
    }

    subscription = await queryRunner.manager.save(subscription);

    // 2. Record Payment
    const payment = queryRunner.manager.create(Payment, {
      userId,
      subscriptionId: subscription.id,
      amount: plan ? Number(plan.price) : 4.99,
      currency: plan ? plan.currency : 'USD',
      status: PaymentStatus.SUCCEEDED,
      stripePaymentIntentId: (session.payment_intent as string) ?? null,
      stripeCheckoutSessionId: session.id,
      paymentMethod: 'card',
    });

    await queryRunner.manager.save(payment);

    // 3. Audit log
    await this.auditLogsService.log({
      actorId: userId,
      actorRole: 'STUDENT',
      action: 'SUBSCRIPTION_ACTIVATED',
      entityName: 'Subscription',
      entityId: subscription.id,
      oldValues: { status: oldStatus },
      newValues: { status: SubscriptionStatus.ACTIVE, planId, price: 4.99 },
    });
  }

  private async processInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
    queryRunner: any,
  ) {
    const stripeSubId = (invoice as any).subscription as string;
    if (!stripeSubId) return;

    const subscription = await queryRunner.manager.findOne(Subscription, {
      where: { stripeSubscriptionId: stripeSubId },
    });

    if (!subscription) return;

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.currentPeriodEnd = periodEnd;
    await queryRunner.manager.save(subscription);

    const payment = queryRunner.manager.create(Payment, {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: ((invoice.amount_paid ?? 499) / 100),
      currency: invoice.currency?.toUpperCase() ?? 'USD',
      status: PaymentStatus.SUCCEEDED,
      stripePaymentIntentId: (invoice as any).payment_intent as string ?? null,
      stripeInvoiceId: invoice.id,
      paymentMethod: 'card',
      receiptUrl: (invoice as any).hosted_invoice_url ?? null,
    });

    await queryRunner.manager.save(payment);

    await this.auditLogsService.log({
      actorId: subscription.userId,
      actorRole: 'SYSTEM',
      action: 'SUBSCRIPTION_RENEWED',
      entityName: 'Subscription',
      entityId: subscription.id,
      newValues: { periodEnd, amountPaid: payment.amount },
    });
  }

  private async processInvoicePaymentFailed(
    invoice: Stripe.Invoice,
    queryRunner: any,
  ) {
    const stripeSubId = (invoice as any).subscription as string;
    if (!stripeSubId) return;

    const subscription = await queryRunner.manager.findOne(Subscription, {
      where: { stripeSubscriptionId: stripeSubId },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.PAST_DUE;
      await queryRunner.manager.save(subscription);

      const payment = queryRunner.manager.create(Payment, {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        amount: ((invoice.amount_due ?? 499) / 100),
        currency: invoice.currency?.toUpperCase() ?? 'USD',
        status: PaymentStatus.FAILED,
        stripeInvoiceId: invoice.id,
        failureReason: 'Payment attempt failed by card issuer',
      });

      await queryRunner.manager.save(payment);
    }
  }

  private async processSubscriptionDeleted(
    stripeSub: Stripe.Subscription,
    queryRunner: any,
  ) {
    const subscription = await queryRunner.manager.findOne(Subscription, {
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.endedAt = new Date();
      await queryRunner.manager.save(subscription);

      await this.auditLogsService.log({
        actorId: subscription.userId,
        actorRole: 'SYSTEM',
        action: 'SUBSCRIPTION_EXPIRED',
        entityName: 'Subscription',
        entityId: subscription.id,
        newValues: { status: SubscriptionStatus.CANCELED },
      });
    }
  }

  /**
   * 3. Student Billing History
   */
  async findUserPayments(userId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { userId },
      relations: { subscription: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { user: true, subscription: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record with ID "${id}" was not found.`);
    }

    return payment;
  }

  /**
   * 4. Admin Payment Management
   */
  async findAllAdmin(query: QueryPaymentsDto): Promise<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.subscription', 's');

    if (query.status) {
      qb.andWhere('p.status = :status', { status: query.status });
    }
    if (query.userId) {
      qb.andWhere('p.userId = :userId', { userId: query.userId });
    }

    qb.orderBy('p.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * 5. Admin Refund Processing with Database Transaction & Audit Log
   */
  async refundPayment(
    paymentId: string,
    dto: RefundPaymentDto,
    adminId: string,
    adminEmail?: string,
  ): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment is already fully refunded.');
    }

    const refundAmount = dto.amount ?? Number(payment.amount);
    if (refundAmount <= 0 || refundAmount > Number(payment.amount)) {
      throw new BadRequestException(`Refund amount must be between 0.01 and ${payment.amount}`);
    }

    // Call Stripe to process the refund
    if (payment.stripePaymentIntentId) {
      await this.stripeService.processRefund({
        paymentIntentId: payment.stripePaymentIntentId,
        amount: refundAmount,
        reason: dto.reason,
      });
    }

    const oldStatus = payment.status;
    const isFullRefund = refundAmount >= Number(payment.amount);

    payment.refundedAmount = Number(payment.refundedAmount) + refundAmount;
    payment.status = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    payment.refundReason = dto.reason ?? 'Admin requested refund';

    const savedPayment = await this.paymentRepository.save(payment);

    // Record audit log
    await this.auditLogsService.log({
      actorId: adminId,
      actorEmail: adminEmail,
      actorRole: 'ADMIN',
      action: 'PAYMENT_REFUNDED',
      entityName: 'Payment',
      entityId: payment.id,
      oldValues: { status: oldStatus, refundedAmount: 0 },
      newValues: { status: savedPayment.status, refundedAmount: refundAmount, reason: dto.reason },
    });

    return savedPayment;
  }
}
