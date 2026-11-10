import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternshipsService } from './internships.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/userRole.js';
import { CurrentUser } from '../common/decorators/currentUser.decotaror.js';
import { CreateInternshipDto } from './dtos/create.internship.dto.js';
import { UpdateInternshipDto } from './dtos/update.internship.dto.js';
import { Internship } from './entities/internship.entity.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';


@ApiTags('Internships')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.RECRUITER)
@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Get()
  async getInternships(): Promise<Internship[]> {
    return this.internshipsService.getInternships();
  }

  @Get(':id')
  async getInternship(@Param('id', ParseUUIDPipe) id: string): Promise<Internship | null> {
    return this.internshipsService.getInternship(id);
  }

  @Post()
  async createInternship(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInternshipDto,
  ): Promise<Internship> {
    return this.internshipsService.createInternship(user.id, dto);
  }

  @Patch(':id')
  async updateInternship(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInternshipDto,
  ): Promise<Internship | null> {
    return this.internshipsService.updateInternship(user, id, dto);
  }
}
