import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SavedSearch } from './entities/saved-search.entity.js';
import { StudentProfiles } from '../student-profile/entity/student-profile.entity.js';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto.js';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto.js';
import { SavedSearchQueryDto } from './dto/saved-search-query.dto.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@Injectable()
export class SavedSearchesService {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly savedSearchesRepository: Repository<SavedSearch>,
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

  async create(user: AuthenticatedUser, dto: CreateSavedSearchDto) {
    const profile = await this.resolveProfile(user);

    return this.savedSearchesRepository.save(
      this.savedSearchesRepository.create({
        studentProfileId: profile.id,
        name: dto.name,
        filters: dto.filters,
        alertEnabled: dto.alertEnabled ?? false,
      }),
    );
  }

  async findAll(user: AuthenticatedUser, query: SavedSearchQueryDto) {
    const profile = await this.resolveProfile(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.savedSearchesRepository.findAndCount({
      where: { studentProfileId: profile.id },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const profile = await this.resolveProfile(user);

    const savedSearch = await this.savedSearchesRepository.findOne({
      where: { id, studentProfileId: profile.id },
    });
    if (!savedSearch) {
      throw new NotFoundException('Saved search not found.');
    }

    return savedSearch;
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateSavedSearchDto) {
    const savedSearch = await this.findOne(user, id);

    Object.assign(savedSearch, dto);
    await this.savedSearchesRepository.save(savedSearch);

    return savedSearch;
  }

  async remove(user: AuthenticatedUser, id: string) {
    const result = await this.savedSearchesRepository.delete({
      id,
      studentProfileId: (await this.resolveProfile(user)).id,
    });

    if (!result.affected) {
      throw new NotFoundException('Saved search not found.');
    }
  }

  async toggleAlert(user: AuthenticatedUser, id: string) {
    const savedSearch = await this.findOne(user, id);

    savedSearch.alertEnabled = !savedSearch.alertEnabled;
    await this.savedSearchesRepository.save(savedSearch);

    return savedSearch;
  }
}
