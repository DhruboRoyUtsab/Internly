import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [RecruitersModule, ApplicationsModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
