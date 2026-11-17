import { Module } from '@nestjs/common';
import { StudentVerificationService } from './student-verification.service.js';
import { StudentVerificationController } from './student-verification.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentVerifications } from './entity/student-verification.entity.js';
import { Users } from '../users/entity/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([StudentVerifications, Users])],
  controllers: [StudentVerificationController],
  providers: [StudentVerificationService],
  exports: [StudentVerificationService],
})
export class StudentVerificationModule {}
