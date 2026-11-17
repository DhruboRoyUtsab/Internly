import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PremiumPlan } from './entities/premium-plan.entity.js';
import { Subscription } from './entities/subscription.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { PlansController } from './plans.controller.js';
import { PlansService } from './plans.service.js';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { AdminSubscriptionsController } from './admin-subscriptions.controller.js';
import { AdminAnalyticsController } from './admin-analytics.controller.js';
import { PremiumEntitlementService } from './premium-entitlement.service.js';
import { PremiumGuard } from './guards/premium.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([PremiumPlan, Subscription, Payment])],
  controllers: [
    PlansController,
    SubscriptionsController,
    AdminSubscriptionsController,
    AdminAnalyticsController,
  ],
  providers: [
    PlansService,
    SubscriptionsService,
    PremiumEntitlementService,
    PremiumGuard,
  ],
  exports: [
    PlansService,
    SubscriptionsService,
    PremiumEntitlementService,
    PremiumGuard,
  ],
})
export class SubscriptionsModule {}
