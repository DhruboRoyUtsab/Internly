import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { InternshipsModule } from './internships/internships.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MailModule } from './mail/mail.module.js';
import { StudentProfileModule } from './student-profile/student-profile.module.js';
import { StudentVerificationModule } from './student-verification/student-verification.module.js';
import { AdminUsersModule } from './admin-users/admin-users.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { SavedInternshipsModule } from './saved-internships/saved-internships.module.js';
import { SavedSearchesModule } from './saved-searches/saved-searches.module.js';
import { AlertPreferencesModule } from './alert-preferences/alert-preferences.module.js';
import { EmailIntegrationModule } from './email-integration/email-integration.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'internly',
      autoLoadEntities: true,
      synchronize: true,
    }),
    RecruitersModule,
    InternshipsModule,
    UsersModule,
    AuthModule,
    MailModule,
    StudentProfileModule,
    StudentVerificationModule,
    AdminUsersModule,
    ApplicationsModule,
    NotificationsModule,
    SavedInternshipsModule,
    SavedSearchesModule,
    AlertPreferencesModule,
    EmailIntegrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
