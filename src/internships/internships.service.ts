import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from './entities/internship.entity.js';
import { CreateInternshipDto } from './dtos/create.internship.dto.js';
import { UpdateInternshipDto } from './dtos/update.internship.dto.js';
import { RecruitersService } from '../recruiters/recruiters.service.js';
import { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';
import { UserRole } from '../common/enums/userRole.js';

@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(Internship)
    private readonly repo: Repository<Internship>,
    private readonly recruitersService: RecruitersService,
  ) {}

  async getInternships(): Promise<Internship[]> {
    return await this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getInternship(id: string): Promise<Internship | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async createInternship(userId: string, dto: CreateInternshipDto): Promise<Internship> {
    const recruiterProfile = await this.recruitersService.getRecruiterProfile(userId);
    if (!recruiterProfile) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const internship = this.repo.create({
      ...dto,
      deadline: new Date(dto.deadline),
      recruiter: recruiterProfile,
    });
    return await this.repo.save(internship);
  }

  async updateInternship(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateInternshipDto,
  ): Promise<Internship | null> {
    const internship = await this.repo.findOne({
      where: { id },
      relations: { recruiter: true },
    });
    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      internship.recruiter.recruiterId !== user.id
    ) {
      throw new ForbiddenException('You can only update your own internships');
    }

    const { deadline, ...rest } = dto;
    await this.repo.update({ id }, {
      ...rest,
      ...(deadline !== undefined ? { deadline: new Date(deadline) } : {}),
    });

    return await this.repo.findOne({ where: { id } });
  }
}
