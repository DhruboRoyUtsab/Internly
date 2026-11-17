import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity.js';
import { StripeEvent } from './entities/stripe-event.entity.js';
import { Subscription } from '../subscriptions/entities/subscription.entity.js';
import { PremiumPlan } from '../subscriptions/entities/premium-plan.entity.js';
import { User } from '../users/entities/user.entity.js';
import { StripeService } from './stripe.service.js';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { WebhooksController } from './webhooks.controller.js';
import { AdminPaymentsController } from './admin-payments.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      StripeEvent,
      Subscription,
      PremiumPlan,
      User,
    ]),
  ],
  controllers: [
    PaymentsController,
    WebhooksController,
    AdminPaymentsController,
  ],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
