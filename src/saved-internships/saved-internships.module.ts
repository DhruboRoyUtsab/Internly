import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedInternshipsService } from './saved-internships.service.js';
import { SavedInternshipsController } from './saved-internships.controller.js';
import { SavedInternship } from './entities/saved-internship.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([SavedInternship])],
  controllers: [SavedInternshipsController],
  providers: [SavedInternshipsService],
})
export class SavedInternshipsModule {}
