import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { ApplicationsModule } from './applications/applications.module.js';

@Module({
  imports: [RecruitersModule, ApplicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
