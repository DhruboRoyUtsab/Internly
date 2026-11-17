import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service.js';
import { PremiumEntitlementService } from './premium-entitlement.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, AuthenticatedUserPayload } from '../common/decorators/current-user.decorator.js';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT-auth')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly entitlementService: PremiumEntitlementService,
  ) {}

  @Get('my-subscription')
  async getMySubscription(@CurrentUser() user: AuthenticatedUserPayload) {
    const entitlement = await this.entitlementService.getStudentEntitlement(user.id);
    const subscription = await this.subscriptionsService.getStudentSubscription(user.id);

    return {
      entitlement,
      subscription,
    };
  }

  @Post('cancel')
  async cancelMySubscription(@CurrentUser() user: AuthenticatedUserPayload) {
    return await this.subscriptionsService.cancelStudentSubscription(user.id);
  }
}
