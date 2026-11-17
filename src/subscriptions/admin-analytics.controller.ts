import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';

@ApiTags('Admin - Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('overview')
  async getOverview() {
    return await this.subscriptionsService.getAnalyticsOverview();
  }
}
