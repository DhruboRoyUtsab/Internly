import { Injectable, Logger } from '@nestjs/common';

import { MailService } from '../mail/mail.service.js';
import {
  ApplicationStatusUpdatedEmailData,
  ApplicationSubmittedEmailData,
  applicationStatusUpdatedTemplate,
  applicationSubmittedTemplate,
} from './templates/email-templates.js';

@Injectable()
export class EmailIntegrationService {
  private readonly logger = new Logger(EmailIntegrationService.name);

  constructor(private readonly mailService: MailService) {}

  async sendApplicationSubmittedEmail(
    to: string,
    data: ApplicationSubmittedEmailData,
  ) {
    try {
      await this.mailService.send(
        to,
        `Application submitted: ${data.internshipTitle}`,
        applicationSubmittedTemplate(data),
      );
    } catch (error) {
      this.logger.error(`Failed to send application-submitted email: ${error}`);
    }
  }

  async sendApplicationStatusUpdatedEmail(
    to: string,
    data: ApplicationStatusUpdatedEmailData,
  ) {
    try {
      await this.mailService.send(
        to,
        `Application status updated: ${data.internshipTitle}`,
        applicationStatusUpdatedTemplate(data),
      );
    } catch (error) {
      this.logger.error(`Failed to send application-status email: ${error}`);
    }
  }
}
