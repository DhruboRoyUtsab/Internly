import { Module } from '@nestjs/common';
import { RecruitersService } from './recruiters.service.js';
import { RecruitersController } from './recruiters.controller.js';
import { RecruiterProfileEntities } from './entities/recruiter.profile.entities.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RecruiterProfileEntities])],
  controllers: [RecruitersController],
  providers: [RecruitersService],
  exports: [RecruitersService],
})
export class RecruitersModule {}
