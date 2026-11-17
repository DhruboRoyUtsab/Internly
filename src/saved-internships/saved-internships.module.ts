import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedInternshipsService } from './saved-internships.service.js';
import { SavedInternshipsController } from './saved-internships.controller.js';
import { SavedInternship } from './entities/saved-internship.entity.js';
import { Internship } from '../internships/entities/internship.entity.js';
import { StudentProfiles } from '../student-profile/entity/student-profile.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedInternship, Internship, StudentProfiles]),
  ],
  controllers: [SavedInternshipsController],
  providers: [SavedInternshipsService],
})
export class SavedInternshipsModule {}
