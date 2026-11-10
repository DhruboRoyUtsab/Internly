import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { InternshipsModule } from './internships/internships.module.js';

@Module({
  imports: [RecruitersModule, InternshipsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
