import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';

@ApiTags('Webhooks')
@Controller('webhooks/stripe')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody || req.body;

    if (!rawBody) {
      throw new BadRequestException('Missing raw body in webhook request.');
    }

    return await this.paymentsService.handleWebhook(rawBody, signature || '');
  }
}
