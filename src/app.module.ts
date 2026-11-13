import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { SavedInternshipsModule } from './saved-internships/saved-internships.module.js';
import { SavedSearchesModule } from './saved-searches/saved-searches.module.js';

@Module({
  imports: [RecruitersModule, ApplicationsModule, NotificationsModule, SavedInternshipsModule, SavedSearchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
