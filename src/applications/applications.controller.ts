import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import { ApplicationQueryDto } from './dto/application-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/currentUser.decotaror.js';
import { UserRole } from '../common/enums/userRole.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @ApiOperation({ summary: 'Apply to an internship (transaction)' })
  @Post('internships/:internshipId/applications')
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('internshipId') internshipId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.submitApplication(user, internshipId, dto);
  }

  @ApiOperation({ summary: 'List my applications' })
  @Get('applications/me')
  findMyApplications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ApplicationQueryDto,
  ) {
    return this.applicationsService.findStudentApplications(user, query);
  }

  @ApiOperation({ summary: 'Application detail' })
  @Get('applications/:id')
  findApplication(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.applicationsService.findApplicationDetail(user, id);
  }

  @ApiOperation({ summary: 'Application status history' })
  @Get('applications/:id/history')
  findApplicationHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.applicationsService.findApplicationHistory(user, id);
  }

  @ApiOperation({ summary: 'List applicants for an internship' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @Get('internships/:internshipId/applications')
  findApplicants(
    @CurrentUser() user: AuthenticatedUser,
    @Param('internshipId') internshipId: string,
    @Query() query: ApplicationQueryDto,
  ) {
    return this.applicationsService.findInternshipApplications(
      user,
      internshipId,
      query,
    );
  }

  @ApiOperation({ summary: 'Change application status' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @Patch('applications/:id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(user, id, dto);
  }
}
