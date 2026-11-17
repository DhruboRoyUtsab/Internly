import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { CurrentUser, AuthenticatedUserPayload } from '../common/decorators/current-user.decorator.js';

@ApiTags('Admin - Subscriptions')
@ApiBearerAuth('JWT-auth')
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async findAll(
    @Query('status') status?: SubscriptionStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.subscriptionsService.findAllAdmin({
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.subscriptionsService.findOneAdmin(id);
  }

  @Post(':id/cancel')
  async forceCancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() admin: AuthenticatedUserPayload,
  ) {
    return await this.subscriptionsService.cancelAdmin(id, admin.id, admin.email);
  }
}
