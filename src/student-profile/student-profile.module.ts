import { Module } from '@nestjs/common';
import { StudentProfileService } from './student-profile.service.js';
import { StudentProfileController } from './student-profile.controller.js';

@Module({
  controllers: [StudentProfileController],
  providers: [StudentProfileService],
})
export class StudentProfileModule {}
