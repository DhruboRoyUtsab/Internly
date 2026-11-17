import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import { ApplicationQueryDto } from './dto/application-query.dto.js';

@Controller()
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Post('internships/:internshipId/applications')
  submit(
    @Param('internshipId') internshipId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.submitApplication(internshipId, dto);
  }

  @Get('applications/me')
  findMyApplications(@Query() query: ApplicationQueryDto) {
    return this.applicationsService.findStudentApplications(query);
  }

  @Get('internships/:internshipId/applications')
  findApplicants(
    @Param('internshipId') internshipId: string,
    @Query() query: ApplicationQueryDto,
  ) {
    return this.applicationsService.findInternshipApplications(
      internshipId,
      query,
    );
  }

  @Patch('applications/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, dto);
  }
}