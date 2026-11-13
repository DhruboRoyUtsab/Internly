import { Body, Controller, Get, Patch } from '@nestjs/common';
import { AlertPreferencesService } from './alert-preferences.service.js';
import { UpdateAlertPreferenceDto } from './dto/update-alert-preference.dto.js';

@Controller('alert-preferences')
export class AlertPreferencesController {
  constructor(
    private readonly alertPreferencesService: AlertPreferencesService,
  ) {}

  @Get()
  findOne() {
    return this.alertPreferencesService.findOne();
  }

  @Patch()
  update(@Body() dto: UpdateAlertPreferenceDto) {
    return this.alertPreferencesService.update(dto);
  }
}
