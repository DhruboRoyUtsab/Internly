import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, AuthenticatedUserPayload } from '../common/decorators/current-user.decorator.js';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  async createCheckoutSession(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return await this.paymentsService.createCheckoutSession(user.id, dto);
  }

  @Get('history')
  async getMyPaymentHistory(@CurrentUser() user: AuthenticatedUserPayload) {
    return await this.paymentsService.findUserPayments(user.id);
  }

  @Get(':id')
  async getPaymentById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.paymentsService.findOne(id);
  }
}
