import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';
import { DemoPayDto } from './dto/demo-pay.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, AuthenticatedUserPayload } from '../common/decorators/current-user.decorator.js';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('demo-pay')
  @ApiOperation({
    summary: '1-Click Demo Payment ($4.99)',
    description:
      'Simulates a successful $4.99 payment for live demo/grading. Immediately activates Premium, populates the stripe_events idempotency table, and creates an audit log.',
  })
  async demoPay(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: DemoPayDto,
  ) {
    return await this.paymentsService.processDemoPayment(user.id, dto);
  }

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
