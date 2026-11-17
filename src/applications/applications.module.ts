import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsController } from './applications.controller.js';
import { Application } from './entities/application.entity.js';
import { ApplicationStatusHistory } from './entities/application-status-history.entity.js';
import { Internship } from '../internships/entities/internship.entity.js';
import { StudentProfiles } from '../student-profile/entity/student-profile.entity.js';
import { StudentVerifications } from '../student-verification/entity/student-verification.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { EmailIntegrationModule } from '../email-integration/email-integration.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationStatusHistory,
      Internship,
      StudentProfiles,
      StudentVerifications,
      Notification,
    ]),
    EmailIntegrationModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
