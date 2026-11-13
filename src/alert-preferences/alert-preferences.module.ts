import { Module } from '@nestjs/common';
import { AlertPreferencesService } from './alert-preferences.service.js';
import { AlertPreferencesController } from './alert-preferences.controller.js';

@Module({
  controllers: [AlertPreferencesController],
  providers: [AlertPreferencesService],
})
export class AlertPreferencesModule {}
