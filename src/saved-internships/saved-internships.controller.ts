import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SavedInternshipsService } from './saved-internships.service.js';
import { SavedInternshipQueryDto } from './dto/saved-internship-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/currentUser.decotaror.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@ApiTags('Saved Internships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-internships')
export class SavedInternshipsController {
  constructor(
    private readonly savedInternshipsService: SavedInternshipsService,
  ) {}

  @ApiOperation({ summary: 'Save an internship' })
  @Post(':internshipId')
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Param('internshipId') internshipId: string,
  ) {
    return this.savedInternshipsService.save(user, internshipId);
  }

  @ApiOperation({ summary: 'List my saved internships' })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SavedInternshipQueryDto,
  ) {
    return this.savedInternshipsService.findAll(user, query);
  }

  @ApiOperation({ summary: 'Unsave an internship' })
  @Delete(':internshipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('internshipId') internshipId: string,
  ) {
    return this.savedInternshipsService.remove(user, internshipId);
  }
}
