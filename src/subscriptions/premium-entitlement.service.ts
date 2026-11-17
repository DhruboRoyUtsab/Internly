import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Subscription } from './entities/subscription.entity.js';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum.js';

export interface PremiumEntitlementInfo {
  isPremium: boolean;
  status?: SubscriptionStatus;
  planName?: string;
  expiresAt?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

@Injectable()
export class PremiumEntitlementService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  /**
   * Fast check for Member 2 & 3: Check if student has an active Premium subscription.
   */
  async isStudentPremium(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const now = new Date();

    const activeSubscription = await this.subscriptionRepository.findOne({
      where: [
        {
          userId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: MoreThan(now),
        },
        {
          userId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: undefined, // Lifetime or unset
        },
      ],
    });

    return !!activeSubscription;
  }

  /**
   * Detailed entitlement details for profile/dashboard views.
   */
  async getStudentEntitlement(userId: string): Promise<PremiumEntitlementInfo> {
    const now = new Date();

    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      return { isPremium: false };
    }

    const isActive =
      subscription.status === SubscriptionStatus.ACTIVE &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > now);

    return {
      isPremium: isActive,
      status: subscription.status,
      planName: subscription.plan?.name ?? 'Premium Student Plan',
      expiresAt: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }

  /**
   * Reusable assertion that throws 403 ForbiddenException if not Premium.
   */
  async assertPremium(userId: string): Promise<void> {
    const isPremium = await this.isStudentPremium(userId);
    if (!isPremium) {
      throw new ForbiddenException(
        'Access denied: This feature is exclusive to active Premium student subscribers ($4.99/mo).',
      );
    }
  }
}
