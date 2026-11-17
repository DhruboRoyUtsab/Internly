import { Module } from '@nestjs/common';
import { SavedInternshipsService } from './saved-internships.service.js';
import { SavedInternshipsController } from './saved-internships.controller.js';

@Module({
  controllers: [SavedInternshipsController],
  providers: [SavedInternshipsService],
})
export class SavedInternshipsModule {}
