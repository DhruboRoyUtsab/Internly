import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentVerifications } from './entity/student-verification.entity.js';
import { Not, Repository } from 'typeorm';
import { Users } from '../users/entity/user.entity.js';
import { CreateStudentVerificationDto } from './dto/create-student-verification.dto.js';
import { ReviewStudentVerificationDto } from './dto/review-student-verification.dto.js';

@Injectable()
export class StudentVerificationService {
  constructor(
    @InjectRepository(StudentVerifications)
    private readonly verifyRepo: Repository<StudentVerifications>,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}
  async createStudentVerification(
    verification: CreateStudentVerificationDto,
  ): Promise<StudentVerifications> {
    const user = await this.userRepo.findOneBy({ id: verification.userId });
    if (!user) {
      throw new NotFoundException('User not Found!');
    }

    const exist = await this.verifyRepo.findOneBy({
      userId: verification.userId,
    });

    if (exist && exist.status !== 'REJECTED') {
      throw new ConflictException(
        'This user already has a verification request!',
      );
    }

    if (exist) {
      await this.verifyRepo.update(
        {
          id: exist.id,
        },
        {
          status: 'PENDING',
          documentUrl: verification.documentUrl,
          adminNote: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      );
      return this.getStudentVerificationById(exist.id);
    }
    const newVerification = this.verifyRepo.create({ ...verification });
    return this.verifyRepo.save(newVerification);
  }

  async getAllStudentVerifications(): Promise<StudentVerifications[]> {
    return this.verifyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getStudentVerificationById(id: string): Promise<StudentVerifications> {
    const verify = await this.verifyRepo.findOneBy({ id });
    if (!verify) {
      throw new NotFoundException('Verification request not found!');
    }
    return verify;
  }

  async getVerificationByUser(userId: string): Promise<StudentVerifications> {
    const verify = await this.verifyRepo.findOneBy({ userId });

    if (!verify) {
      throw new NotFoundException('Verification request not Found!');
    }

    return verify;
  }

  async reviewStudentVerification(
    id: string,
    review: ReviewStudentVerificationDto,
  ): Promise<StudentVerifications> {
    const verify = await this.getStudentVerificationById(id);

    await this.verifyRepo.update(
      { id: verify.id },
      {
        status: review.status,
        adminNote: review.adminNote ?? null,
        reviewedBy: review.reviewedBy ?? null,
        reviewedAt: new Date(),
      },
    );
    return this.getStudentVerificationById(id);
  }

  async deleteStudentVerification(id: string): Promise<string> {
    const res = (await this.verifyRepo.delete(id)).affected;
    if (res != null && res > 0) {
      return `Verification request Deleted Successfully id ${id}`;
    }
    return 'Verification request not Found';
  }

  async deleteStudentVerificationSoft(id: string): Promise<string> {
    const res = (await this.verifyRepo.softDelete(id)).affected;
    if (res != null && res > 0) {
      return `Verification request Deleted Successfully id ${id}`;
    }
    return 'Verification request not Found';
  }
}
