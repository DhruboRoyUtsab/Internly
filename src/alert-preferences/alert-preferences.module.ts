import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertPreferencesService } from './alert-preferences.service.js';
import { AlertPreferencesController } from './alert-preferences.controller.js';
import { AlertPreference } from './entities/alert-preference.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([AlertPreference])],
  controllers: [AlertPreferencesController],
  providers: [AlertPreferencesService],
})
export class AlertPreferencesModule {}
