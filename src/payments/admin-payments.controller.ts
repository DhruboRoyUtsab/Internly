import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { QueryPaymentsDto } from './dto/query-payments.dto.js';
import { RefundPaymentDto } from './dto/refund-payment.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { CurrentUser, AuthenticatedUserPayload } from '../common/decorators/current-user.decorator.js';

@ApiTags('Admin - Payments')
@ApiBearerAuth('JWT-auth')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Query() query: QueryPaymentsDto) {
    return await this.paymentsService.findAllAdmin(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.paymentsService.findOne(id);
  }

  @Post(':id/refund')
  async refundPayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() admin: AuthenticatedUserPayload,
  ) {
    return await this.paymentsService.refundPayment(id, dto, admin.id, admin.email);
  }
}
