import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Subscription } from './entities/subscription.entity.js';
import { PremiumPlan } from './entities/premium-plan.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum.js';
import { PaymentStatus } from '../common/enums/payment-status.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(PremiumPlan)
    private readonly planRepository: Repository<PremiumPlan>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Get student's current subscription
   */
  async getStudentSubscription(userId: string): Promise<Subscription | null> {
    return await this.subscriptionRepository.findOne({
      where: { userId },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Student cancel subscription (cancels at end of billing cycle)
   */
  async cancelStudentSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      relations: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('No active Premium subscription found to cancel.');
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();

    const saved = await this.subscriptionRepository.save(subscription);

    await this.auditLogsService.log({
      actorId: userId,
      actorRole: 'STUDENT',
      action: 'SUBSCRIPTION_CANCELED',
      entityName: 'Subscription',
      entityId: subscription.id,
      newValues: { cancelAtPeriodEnd: true, canceledAt: subscription.canceledAt },
    });

    return saved;
  }

  /**
   * Admin: List all subscriptions with pagination
   */
  async findAllAdmin(query: { status?: SubscriptionStatus; page?: number; limit?: number }): Promise<{
    data: Subscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.subscriptionRepository.createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('s.plan', 'p');

    if (query.status) {
      qb.andWhere('s.status = :status', { status: query.status });
    }

    qb.orderBy('s.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOneAdmin(id: string): Promise<Subscription> {
    const sub = await this.subscriptionRepository.findOne({
      where: { id },
      relations: { user: true, plan: true },
    });

    if (!sub) {
      throw new NotFoundException(`Subscription with ID "${id}" was not found.`);
    }

    return sub;
  }

  /**
   * Admin: Force cancel a subscription immediately
   */
  async cancelAdmin(id: string, adminId: string, adminEmail?: string): Promise<Subscription> {
    const sub = await this.findOneAdmin(id);

    sub.status = SubscriptionStatus.CANCELED;
    sub.cancelAtPeriodEnd = false;
    sub.canceledAt = new Date();
    sub.endedAt = new Date();

    const saved = await this.subscriptionRepository.save(sub);

    await this.auditLogsService.log({
      actorId: adminId,
      actorEmail: adminEmail,
      actorRole: 'ADMIN',
      action: 'ADMIN_FORCE_CANCEL_SUBSCRIPTION',
      entityName: 'Subscription',
      entityId: sub.id,
      newValues: { status: SubscriptionStatus.CANCELED },
    });

    return saved;
  }

  /**
   * Admin: Platform Billing & Subscription Analytics Overview
   */
  async getAnalyticsOverview(): Promise<{
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    activeSubscribers: number;
    totalSubscribers: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
  }> {
    const now = new Date();

    const activeSubscribers = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE, currentPeriodEnd: MoreThan(now) },
    });

    const totalSubscribers = await this.subscriptionRepository.count();

    // Payments aggregation
    const payments = await this.paymentRepository.find();
    let totalRevenue = 0;
    let successfulPayments = 0;
    let failedPayments = 0;
    let refundedAmount = 0;

    for (const p of payments) {
      if (p.status === PaymentStatus.SUCCEEDED) {
        totalRevenue += Number(p.amount);
        successfulPayments += 1;
      } else if (p.status === PaymentStatus.FAILED) {
        failedPayments += 1;
      } else if (p.status === PaymentStatus.REFUNDED || p.status === PaymentStatus.PARTIALLY_REFUNDED) {
        totalRevenue += Number(p.amount) - Number(p.refundedAmount);
        refundedAmount += Number(p.refundedAmount);
      }
    }

    const monthlyRecurringRevenue = activeSubscribers * 4.99;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      monthlyRecurringRevenue: Number(monthlyRecurringRevenue.toFixed(2)),
      activeSubscribers,
      totalSubscribers,
      successfulPayments,
      failedPayments,
      refundedAmount: Number(refundedAmount.toFixed(2)),
    };
  }
}
