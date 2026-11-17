import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecruitersService } from './recruiters.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/userRole.js';
import { RecruiterProfileDto } from './dtos/recruiter.profile.dto.js';
import { RecruiterProfileEntities } from './entities/recruiter.profile.entities.js';

@ApiTags('Recruiters')
@ApiBearerAuth()
@Roles(UserRole.RECRUITER)
@Controller('recruiters/profile')
export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}

  @Get(":id")
  async getRecruiterProfile(@Param("id") id:string):Promise<RecruiterProfileEntities | null> {
    return await this.recruitersService.getRecruiterProfile(id);
  }

  @Patch(":id")
  async updateRecruiterProfile(@Param("id") id:string, @Body()  dto: RecruiterProfileDto):Promise<RecruiterProfileEntities | null> {
    return await this.recruitersService.updateRecruiterProfile(id, dto);
  }
}
