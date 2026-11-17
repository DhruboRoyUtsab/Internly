import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RecruiterProfileEntities } from './entities/recruiter.profile.entities.js';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruiterProfileDto } from './dtos/recruiter.profile.dto.js';

@Injectable()
export class RecruitersService {

    constructor( @InjectRepository(RecruiterProfileEntities) private readonly repo: Repository<RecruiterProfileEntities>,) {}

    async getRecruiterProfile(id: string): Promise<RecruiterProfileEntities | null> {
        return  await this.repo.findOne({ where: { recruiterId: id } });
    }


    async updateRecruiterProfile(id: string, dto: RecruiterProfileDto): Promise<RecruiterProfileEntities | null> {
        const recruiterProfile = await this.repo.findOne({ where: { recruiterId: id } });
        if (!recruiterProfile) {
            throw new Error('Recruiter profile not found');
        }
        await this.repo.update({ recruiterId: id }, dto);
        return await this.repo.findOne({ where: { recruiterId: id } });
    }
}
