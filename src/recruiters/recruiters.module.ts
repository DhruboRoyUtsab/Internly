import { Module } from '@nestjs/common';
import { RecruitersService } from './recruiters.service.js';
import { RecruitersController } from './recruiters.controller.js';

@Module({
  controllers: [RecruitersController],
  providers: [RecruitersService],
})
export class RecruitersModule {}
