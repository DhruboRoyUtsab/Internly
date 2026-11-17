import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSearchesService } from './saved-searches.service.js';
import { SavedSearchesController } from './saved-searches.controller.js';
import { SavedSearch } from './entities/saved-search.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([SavedSearch])],
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService],
})
export class SavedSearchesModule {}
