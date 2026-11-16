import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfileService } from './student-profile.service.js';
import { StudentProfileController } from './student-profile.controller.js';
import { StudentProfiles } from './entity/student-profile.entity.js';
import { Users } from '../users/entity/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfiles, Users])],
  controllers: [StudentProfileController],
  providers: [StudentProfileService],
})
export class StudentProfileModule {}
