import { Module } from '@nestjs/common';

import { MailModule } from '../mail/mail.module.js';
import { EmailIntegrationService } from './email-integration.service.js';

@Module({
  imports: [MailModule],
  providers: [EmailIntegrationService],
  exports: [EmailIntegrationService],
})
export class EmailIntegrationModule {}
