import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AlertPreferencesService } from './alert-preferences.service.js';
import { UpdateAlertPreferenceDto } from './dto/update-alert-preference.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/currentUser.decotaror.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@ApiTags('Alert Preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alert-preferences')
export class AlertPreferencesController {
  constructor(
    private readonly alertPreferencesService: AlertPreferencesService,
  ) {}

  @ApiOperation({ summary: 'Get my alert preferences' })
  @Get()
  findOne(@CurrentUser() user: AuthenticatedUser) {
    return this.alertPreferencesService.findOne(user);
  }

  @ApiOperation({ summary: 'Update my alert preferences' })
  @Patch()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAlertPreferenceDto,
  ) {
    return this.alertPreferencesService.update(user, dto);
  }
}
