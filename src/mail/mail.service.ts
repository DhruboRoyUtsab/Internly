import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly trannsporter = nodemailer.createTransport(
    process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : { jsonTransport: true },
  );

  async send(to: string, subject: string, html: string): Promise<void> {
    const info = await this.trannsporter.sendMail({
      from: process.env.MAIL_FROM ?? 'Internly <no-reply@internly.test>',
      to,
      subject,
      html,
    });
    if (!process.env.SMTP_HOST) {
      this.logger.log(`[DEV MAIL] to=${to} | subject=${subject}`);
      console.log(String(info.message));
    }
  }
}
