import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentVerificationService } from './student-verification.service.js';
import { CreateStudentVerificationDto } from './dto/create-student-verification.dto.js';
import { StudentVerifications } from './entity/student-verification.entity.js';
import { ReviewStudentVerificationDto } from './dto/review-student-verification.dto.js';
import { Users } from '../users/entity/user.entity.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('Student Verifications')
@Controller('student-verification')
export class StudentVerificationController {
  constructor(
    private readonly studentVerificationService: StudentVerificationService,
  ) {}

  @ApiOperation({ summary: 'Submit a verification request (ID document)' })
  @Post()
  createVerification(
    @Body() verification: CreateStudentVerificationDto,
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.createStudentVerification(
      verification,
    );
  }

  @ApiOperation({ summary: 'Get one verification request by id' })
  @Get(':id')
  getVerification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.getStudentVerificationById(id);
  }

  @ApiOperation({ summary: 'Get the verification request of one user' })
  @Get('user/:userId')
  getVerificationByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.getVerificationByUser(userId);
  }

  @ApiOperation({ summary: 'List all verification requests (newest first)' })
  @Get()
  getAllVerification(): Promise<StudentVerifications[]> {
    return this.studentVerificationService.getAllStudentVerifications();
  }

  @ApiOperation({ summary: 'Admin review — approve or reject (sets reviewed_by/at)' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/review')
  reviewVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() review: ReviewStudentVerificationDto,
    @Req() req: { user: Users },
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.reviewStudentVerification(
      id,
      review,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Hard delete a verification request (admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteVerification(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.studentVerificationService.deleteStudentVerification(id);
  }

  @ApiOperation({ summary: 'Soft delete a verification request (admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('soft/:id')
  deleteVerificationSoft(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.studentVerificationService.deleteStudentVerificationSoft(id);
  }
}
