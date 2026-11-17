import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';

// Member 4 Modules
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';

// Middleware
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';

// Entities
import { User } from './users/entities/user.entity.js';
import { PremiumPlan } from './subscriptions/entities/premium-plan.entity.js';
import { Subscription } from './subscriptions/entities/subscription.entity.js';
import { Payment } from './payments/entities/payment.entity.js';
import { AuditLog } from './audit-logs/entities/audit-log.entity.js';
import { StripeEvent } from './payments/entities/stripe-event.entity.js';

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
      entities: [
        User,
        PremiumPlan,
        Subscription,
        Payment,
        AuditLog,
        StripeEvent,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),
    RecruitersModule,
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
