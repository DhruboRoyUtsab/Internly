import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

// Member 1 Modules
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MailModule } from './mail/mail.module.js';
import { StudentProfileModule } from './student-profile/student-profile.module.js';
import { StudentVerificationModule } from './student-verification/student-verification.module.js';
import { AdminUsersModule } from './admin-users/admin-users.module.js';

// Member 2 Modules
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { InternshipsModule } from './internships/internships.module.js';

// Member 3 Modules
import { ApplicationsModule } from './applications/applications.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { SavedInternshipsModule } from './saved-internships/saved-internships.module.js';
import { SavedSearchesModule } from './saved-searches/saved-searches.module.js';
import { AlertPreferencesModule } from './alert-preferences/alert-preferences.module.js';

// Member 4 Modules
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';

// Middleware
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'adib',
      database: process.env.DB_NAME ?? 'internly_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    // Member 1
    UsersModule,
    AuthModule,
    MailModule,
    StudentProfileModule,
    StudentVerificationModule,
    AdminUsersModule,

    // Member 2
    RecruitersModule,
    InternshipsModule,

    // Member 3
    ApplicationsModule,
    NotificationsModule,
    SavedInternshipsModule,
    SavedSearchesModule,
    AlertPreferencesModule,

    // Member 4
    AuditLogsModule,
    SubscriptionsModule,
    PaymentsModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
