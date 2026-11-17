import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitersModule } from '../recruiters/recruiters.module.js';
import { InternshipsService } from './internships.service.js';
import { InternshipsController } from './internships.controller.js';
import { Internship } from './entities/internship.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Internship]), RecruitersModule],
  controllers: [InternshipsController],
  providers: [InternshipsService],
})
export class InternshipsModule {}
