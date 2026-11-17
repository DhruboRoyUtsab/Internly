import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSearchesService } from './saved-searches.service.js';
import { SavedSearchesController } from './saved-searches.controller.js';
import { SavedSearch } from './entities/saved-search.entity.js';
import { StudentProfiles } from '../student-profile/entity/student-profile.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([SavedSearch, StudentProfiles])],
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService],
})
export class SavedSearchesModule {}
