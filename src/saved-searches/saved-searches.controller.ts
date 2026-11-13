import { Controller } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service.js';

@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}
}
