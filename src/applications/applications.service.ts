import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Application } from './entities/application.entity.js';
import { ApplicationStatusHistory } from './entities/application-status-history.entity.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import { ApplicationQueryDto } from './dto/application-query.dto.js';
import { Internship } from '../internships/entities/internship.entity.js';
import { StudentProfiles } from '../student-profile/entity/student-profile.entity.js';
import { StudentVerifications } from '../student-verification/entity/student-verification.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { EmailIntegrationService } from '../email-integration/email-integration.service.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';
import { APPLICATION_STATUS_TRANSITIONS } from './constants/application-status.constant.js';
import { UserRole } from '../common/enums/userRole.js';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(ApplicationStatusHistory)
    private readonly statusHistoryRepository: Repository<ApplicationStatusHistory>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    @InjectRepository(StudentProfiles)
    private readonly studentProfilesRepository: Repository<StudentProfiles>,
    @InjectRepository(StudentVerifications)
    private readonly verificationsRepository: Repository<StudentVerifications>,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly dataSource: DataSource,
    private readonly emailIntegrationService: EmailIntegrationService,
  ) {}

  async submitApplication(
    user: AuthenticatedUser,
    internshipId: string,
    dto: CreateApplicationDto,
  ) {
    const profile = await this.studentProfilesRepository.findOne({
      where: { userId: user.id },
      relations: { user: true },
    });
    if (!profile) {
      throw new ForbiddenException(
        'You must create your student profile before applying.',
      );
    }

    const verification = await this.verificationsRepository.findOne({
      where: { userId: user.id },
    });
    if (!verification || verification.status !== 'APPROVED') {
      throw new ForbiddenException(
        'Your student account is not verified yet. You cannot apply for internships.',
      );
    }

    const internship = await this.internshipsRepository.findOne({
      where: { id: internshipId },
    });
    if (!internship) {
      throw new NotFoundException('Internship not found.');
    }
    if (internship.status !== 'ACTIVE') {
      throw new ConflictException(
        'This internship is not accepting applications.',
      );
    }
    if (new Date(internship.deadline).getTime() < Date.now()) {
      throw new ConflictException('The application deadline has passed.');
    }

    if (internship.visibility === 'PREMIUM_EXCLUSIVE') {
      throw new ForbiddenException(
        'Premium eligibility checks are not integrated yet. Premium-exclusive internships cannot be applied for.',
      );
    }

    const existing = await this.applicationsRepository.findOne({
      where: { studentProfileId: profile.id, internshipId },
    });
    if (existing) {
      throw new ConflictException(
        'You have already applied to this internship.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const application = await queryRunner.manager.save(
        Application,
        queryRunner.manager.create(Application, {
          studentProfileId: profile.id,
          internshipId,
          coverLetterText: dto.coverLetterText,
        }),
      );

      await queryRunner.manager.save(
        ApplicationStatusHistory,
        queryRunner.manager.create(ApplicationStatusHistory, {
          applicationId: application.id,
          fromStatus: null,
          toStatus: 'APPLIED',
        }),
      );

      await queryRunner.manager.save(
        Notification,
        queryRunner.manager.create(Notification, {
          recipientUserId: user.id,
          type: 'APPLICATION_SUBMITTED',
          title: 'Application Submitted',
          message: `Your application for "${internship.title}" at ${internship.companyName} was submitted successfully.`,
          relatedEntityId: application.id,
        }),
      );

      await queryRunner.commitTransaction();

      void this.emailIntegrationService.sendApplicationSubmittedEmail(
        user.email,
        {
          studentName: profile.user?.fullName ?? user.email,
          internshipTitle: internship.title,
          companyName: internship.companyName,
        },
      );

      return application;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findStudentApplications(
    user: AuthenticatedUser,
    query: ApplicationQueryDto,
  ) {
    const profile = await this.studentProfilesRepository.findOne({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new ForbiddenException(
        'You must create your student profile first.',
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.applicationsRepository.findAndCount({
      where: {
        studentProfileId: profile.id,
        ...(query.status ? { status: query.status } : {}),
      },
      order: { appliedAt: 'DESC' },
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

  async findInternshipApplications(
    user: AuthenticatedUser,
    internshipId: string,
    query: ApplicationQueryDto,
  ) {
    if (user.role !== UserRole.ADMIN) {
      const internship = await this.internshipsRepository.findOne({
        where: { id: internshipId },
        relations: { recruiter: true },
      });
      if (!internship) {
        throw new NotFoundException('Internship not found.');
      }
      if (internship.recruiter?.recruiterId !== user.id) {
        throw new ForbiddenException(
          'You can only view applicants for your own internships.',
        );
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.applicationsRepository.findAndCount({
      where: {
        internshipId,
        ...(query.status ? { status: query.status } : {}),
      },
      order: { appliedAt: 'DESC' },
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

  async updateStatus(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.applicationsRepository.findOne({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    const internship = await this.internshipsRepository.findOne({
      where: { id: application.internshipId },
      relations: { recruiter: true },
    });
    if (!internship) {
      throw new NotFoundException('Internship not found.');
    }
    if (internship.recruiter?.recruiterId !== user.id) {
      throw new ForbiddenException(
        'You can only manage applications for your own internships.',
      );
    }

    const previousStatus = application.status;
    const allowedStatuses =
      APPLICATION_STATUS_TRANSITIONS[previousStatus] ?? [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new ConflictException(
        `Illegal status transition: ${previousStatus} to ${dto.status}.`,
      );
    }

    const studentProfile = await this.studentProfilesRepository.findOne({
      where: { id: application.studentProfileId },
      relations: { user: true },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      application.status = dto.status;
      await queryRunner.manager.save(application);

      await queryRunner.manager.save(
        ApplicationStatusHistory,
        queryRunner.manager.create(ApplicationStatusHistory, {
          applicationId: application.id,
          fromStatus: previousStatus,
          toStatus: dto.status,
          note: dto.note ?? null,
        }),
      );

      if (studentProfile) {
        await queryRunner.manager.save(
          Notification,
          queryRunner.manager.create(Notification, {
            recipientUserId: studentProfile.userId,
            type: 'APPLICATION_STATUS_UPDATED',
            title: 'Application Status Updated',
            message: `Your application for "${internship.title}" at ${internship.companyName} is now ${dto.status}.`,
            relatedEntityId: application.id,
          }),
        );
      }

      await queryRunner.commitTransaction();

      if (studentProfile?.user) {
        void this.emailIntegrationService.sendApplicationStatusUpdatedEmail(
          studentProfile.user.email,
          {
            studentName: studentProfile.user.fullName,
            internshipTitle: internship.title,
            companyName: internship.companyName,
            newStatus: dto.status,
            note: dto.note,
          },
        );
      }

      return application;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findApplicationForViewer(user: AuthenticatedUser, id: string) {
    const application = await this.applicationsRepository.findOne({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    if (user.role === UserRole.ADMIN) {
      return application;
    }

    const internship = await this.internshipsRepository.findOne({
      where: { id: application.internshipId },
      relations: { recruiter: true },
    });
    if (!internship) {
      throw new NotFoundException('Internship not found.');
    }

    if (user.role === UserRole.RECRUITER) {
      if (internship.recruiter?.recruiterId !== user.id) {
        throw new ForbiddenException(
          'You can only view applications for your own internships.',
        );
      }
      return application;
    }

    const profile = await this.studentProfilesRepository.findOne({
      where: { userId: user.id },
    });
    if (!profile || application.studentProfileId !== profile.id) {
      throw new ForbiddenException('You can only view your own applications.');
    }

    return application;
  }

  async findApplicationDetail(user: AuthenticatedUser, id: string) {
    return this.findApplicationForViewer(user, id);
  }

  async findApplicationHistory(user: AuthenticatedUser, id: string) {
    const application = await this.findApplicationForViewer(user, id);

    return this.statusHistoryRepository.find({
      where: { applicationId: application.id },
      order: { createdAt: 'ASC' },
    });
  }
}
