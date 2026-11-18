import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null = null;
  private readonly isMock: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') ?? 'sk_test_placeholder';

    if (
      !secretKey ||
      secretKey.includes('placeholder') ||
      secretKey.includes('demo') ||
      secretKey === 'sk_test_placeholder'
    ) {
      this.logger.warn('Running with Demo Stripe mode. All payment operations will run via built-in simulation.');
      this.isMock = true;
    } else {
      this.stripe = new Stripe(secretKey);
    }
  }

  async createCheckoutSession(params: {
    userId: string;
    userEmail: string;
    planId: string;
    planName: string;
    price: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    if (this.isMock || !this.stripe) {
      const mockSessionId = `cs_test_mock_${Date.now()}`;
      return {
        sessionId: mockSessionId,
        url: `${params.successUrl}?session_id=${mockSessionId}`,
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: params.userEmail,
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: params.planName,
                description: `Monthly subscription to ${params.planName}`,
              },
              unit_amount: Math.round(params.price * 100), // in cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: params.userId,
          planId: params.planId,
        },
        success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: params.cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url ?? '',
      };
    } catch (err: any) {
      this.logger.error(`Stripe checkout session error: ${err.message}`);
      throw new BadRequestException(`Stripe error: ${err.message}`);
    }
  }

  constructWebhookEvent(payload: Buffer | string, signature: string): Stripe.Event {
    const webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? 'whsec_placeholder';

    if (
      this.isMock ||
      !this.stripe ||
      !signature ||
      webhookSecret.includes('placeholder') ||
      webhookSecret.includes('demo')
    ) {
      // In demo/test mode: parse payload directly without external signature failure
      try {
        const json = typeof payload === 'string' ? JSON.parse(payload) : JSON.parse(payload.toString('utf-8'));
        return json as Stripe.Event;
      } catch {
        throw new BadRequestException('Invalid JSON payload in demo webhook.');
      }
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }
  }

  async processRefund(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: string;
  }): Promise<{ refundId: string; amount: number; status: string }> {
    if (this.isMock || !this.stripe) {
      return {
        refundId: `re_mock_${Date.now()}`,
        amount: params.amount ?? 4.99,
        status: 'succeeded',
      };
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: params.paymentIntentId,
        amount: params.amount ? Math.round(params.amount * 100) : undefined,
        reason: (params.reason as any) || 'requested_by_customer',
      });

      return {
        refundId: refund.id,
        amount: (refund.amount ?? 0) / 100,
        status: refund.status ?? 'succeeded',
      };
    } catch (err: any) {
      this.logger.error(`Stripe refund error: ${err.message}`);
      throw new BadRequestException(`Stripe refund error: ${err.message}`);
    }
  }

  async cancelSubscription(stripeSubscriptionId: string, atPeriodEnd: boolean = true): Promise<void> {
    if (this.isMock || !this.stripe) {
      return;
    }

    try {
      if (atPeriodEnd) {
        await this.stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        await this.stripe.subscriptions.cancel(stripeSubscriptionId);
      }
    } catch (err: any) {
      this.logger.error(`Stripe subscription cancel error: ${err.message}`);
      throw new BadRequestException(`Stripe error: ${err.message}`);
    }
  }
}
