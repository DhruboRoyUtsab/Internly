import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AlertPreference } from './entities/alert-preference.entity.js';
import { StudentProfiles } from '../student-profile/entity/student-profile.entity.js';
import { UpdateAlertPreferenceDto } from './dto/update-alert-preference.dto.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@Injectable()
export class AlertPreferencesService {
  constructor(
    @InjectRepository(AlertPreference)
    private readonly alertPreferencesRepository: Repository<AlertPreference>,
    @InjectRepository(StudentProfiles)
    private readonly studentProfilesRepository: Repository<StudentProfiles>,
  ) {}

  private async resolveProfile(user: AuthenticatedUser) {
    const profile = await this.studentProfilesRepository.findOne({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new ForbiddenException(
        'You must create your student profile first.',
      );
    }
    return profile;
  }

  async findOne(user: AuthenticatedUser) {
    const profile = await this.resolveProfile(user);
    return this.findOrCreateDefaults(profile.id);
  }

  async update(user: AuthenticatedUser, dto: UpdateAlertPreferenceDto) {
    const profile = await this.resolveProfile(user);
    const preferences = await this.findOrCreateDefaults(profile.id);

    Object.assign(preferences, dto);
    await this.alertPreferencesRepository.save(preferences);

    return preferences;
  }

  private async findOrCreateDefaults(studentProfileId: string) {
    const existing = await this.alertPreferencesRepository.findOne({
      where: { studentProfileId },
    });
    if (existing) {
      return existing;
    }

    return this.alertPreferencesRepository.save(
      this.alertPreferencesRepository.create({ studentProfileId }),
    );
  }
}
