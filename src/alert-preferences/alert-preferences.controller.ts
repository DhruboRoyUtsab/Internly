import { Controller } from '@nestjs/common';
import { AlertPreferencesService } from './alert-preferences.service.js';

@Controller('alert-preferences')
export class AlertPreferencesController {
  constructor(private readonly alertPreferencesService: AlertPreferencesService) {}
}
