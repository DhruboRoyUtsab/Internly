import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SavedSearchesService } from './saved-searches.service.js';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto.js';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto.js';
import { SavedSearchQueryDto } from './dto/saved-search-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/currentUser.decotaror.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@ApiTags('Saved Searches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @ApiOperation({ summary: 'Create a saved search' })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSavedSearchDto,
  ) {
    return this.savedSearchesService.create(user, dto);
  }

  @ApiOperation({ summary: 'List my saved searches' })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SavedSearchQueryDto,
  ) {
    return this.savedSearchesService.findAll(user, query);
  }

  @ApiOperation({ summary: 'Get a saved search' })
  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.savedSearchesService.findOne(user, id);
  }

  @ApiOperation({ summary: 'Update a saved search' })
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSavedSearchDto,
  ) {
    return this.savedSearchesService.update(user, id, dto);
  }

  @ApiOperation({ summary: 'Delete a saved search' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.savedSearchesService.remove(user, id);
  }

  @ApiOperation({ summary: 'Toggle alert for a saved search' })
  @Patch(':id/alert-toggle')
  toggleAlert(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.savedSearchesService.toggleAlert(user, id);
  }
}
