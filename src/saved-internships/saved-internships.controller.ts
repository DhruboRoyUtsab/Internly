import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { SavedInternshipsService } from './saved-internships.service.js';
import { SavedInternshipQueryDto } from './dto/saved-internship-query.dto.js';



@Controller('saved-internships')
export class SavedInternshipsController {
  constructor(
    private readonly savedInternshipsService: SavedInternshipsService,
  ) {}

  @Post(':internshipId')
  save(@Param('internshipId') internshipId: string) {
    return this.savedInternshipsService.save(internshipId);
  }

  @Get()
  findAll(@Query() query: SavedInternshipQueryDto) {
    return this.savedInternshipsService.findAll(query);
  }

  @Delete(':internshipId')
  remove(@Param('internshipId') internshipId: string) {
    return this.savedInternshipsService.remove(internshipId);
  }
}