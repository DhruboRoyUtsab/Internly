import { Controller } from '@nestjs/common';
import { SavedInternshipsService } from './saved-internships.service.js';

@Controller('saved-internships')
export class SavedInternshipsController {
  constructor(private readonly savedInternshipsService: SavedInternshipsService) {}
}
