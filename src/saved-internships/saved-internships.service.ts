import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SavedInternship } from './entities/saved-internship.entity.js';
import { Internship } from '../internships/entities/internship.entity.js';
import { StudentProfiles } from '../student-profile/entity/student-profile.entity.js';
import { SavedInternshipQueryDto } from './dto/saved-internship-query.dto.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@Injectable()
export class SavedInternshipsService {
  constructor(
    @InjectRepository(SavedInternship)
    private readonly savedInternshipsRepository: Repository<SavedInternship>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
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

  async save(user: AuthenticatedUser, internshipId: string) {
    const profile = await this.resolveProfile(user);

    const internship = await this.internshipsRepository.findOne({
      where: { id: internshipId },
    });
    if (!internship) {
      throw new NotFoundException('Internship not found.');
    }

    const existing = await this.savedInternshipsRepository.findOne({
      where: { studentProfileId: profile.id, internshipId },
    });
    if (existing) {
      throw new ConflictException('Internship is already saved.');
    }

    return this.savedInternshipsRepository.save(
      this.savedInternshipsRepository.create({
        studentProfileId: profile.id,
        internshipId,
      }),
    );
  }

  async findAll(user: AuthenticatedUser, query: SavedInternshipQueryDto) {
    const profile = await this.resolveProfile(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.savedInternshipsRepository.findAndCount({
      where: { studentProfileId: profile.id },
      order: { savedAt: 'DESC' },
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

  async remove(user: AuthenticatedUser, internshipId: string) {
    const profile = await this.resolveProfile(user);

    const result = await this.savedInternshipsRepository.delete({
      studentProfileId: profile.id,
      internshipId,
    });

    if (!result.affected) {
      throw new NotFoundException('Saved internship not found.');
    }
  }
}
