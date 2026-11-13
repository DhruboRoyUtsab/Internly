import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentProfiles } from './entity/student-profile.entity.js';
import { Not, Repository } from 'typeorm';
import { Users } from '../users/entity/user.entity.js';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';

@Injectable()
export class StudentProfileService {
  constructor(
    @InjectRepository(StudentProfiles)
    private readonly profileRepo: Repository<StudentProfiles>,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}

  async createStudentProfile(
    profile: CreateStudentProfileDto,
  ): Promise<StudentProfiles> {
    const user = await this.userRepo.findOneBy({ id: profile.userId });

    if (!user) {
      throw new NotFoundException('User not Found!');
    }

    const exist = await this.profileRepo.findOneBy({
      userId: profile.userId,
    });
    if (exist) {
      throw new ConflictException('This user has already a student profile');
    }
    const newProfile = this.profileRepo.create({ ...profile });

    return this.profileRepo.save(newProfile);
  }

  async getAllStudentProfiles(): Promise<StudentProfiles[]> {
    return this.profileRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getStudentProfileById(id: string): Promise<StudentProfiles> {
    const profile = await this.profileRepo.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException('Student profile not found!');
    }
    return profile;
  }

  async updateStudentProfile(
    id: string,
    updateProfile: UpdateStudentProfileDto,
  ): Promise<StudentProfiles> {
    const profile = await this.getStudentProfileById(id);

    if (updateProfile.userId && updateProfile.userId !== profile.userId) {
      throw new ConflictException('User ID can not be Changed!!');
    }

    await this.profileRepo.update(id, updateProfile);
    return this.getStudentProfileById(id);
  }

  async replaceStudentProfile(
    id: string,
    updateProfile: UpdateStudentProfileDto,
  ): Promise<StudentProfiles> {
    return this.updateStudentProfile(id, updateProfile);
  }

  async deleteStudentProfile(id: string): Promise<string> {
    const res = (await this.profileRepo.delete(id)).affected;

    if (res != null && res > 0) {
      return `Student profile Deleted Successfully id ${id}`;
    }
    return 'Student profile not Found';
  }

  async deleteStudentProfileSoft(id: string): Promise<string> {
    const res = (await this.profileRepo.softDelete(id)).affected;

    if (res != null && res > 0) {
      return `Student profile Deleted Successfully id ${id}`;
    }
    return 'Student profile not Found';
  }
}
