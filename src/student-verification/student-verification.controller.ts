import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { StudentVerificationService } from './student-verification.service.js';
import { CreateStudentVerificationDto } from './dto/create-student-verification.dto.js';
import { StudentVerifications } from './entity/student-verification.entity.js';
import { ReviewStudentVerificationDto } from './dto/review-student-verification.dto.js';

@Controller('student-verification')
export class StudentVerificationController {
  constructor(
    private readonly studentVerificationService: StudentVerificationService,
  ) {}

  @Post()
  createVerification(
    @Body() verification: CreateStudentVerificationDto,
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.createStudentVerification(
      verification,
    );
  }

  @Get(':id')
  getVerification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.getStudentVerificationById(id);
  }

  @Get('user/:userId')
  getVerificationByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.getVerificationByUser(userId);
  }

  @Get()
  getAllVerification(): Promise<StudentVerifications[]> {
    return this.studentVerificationService.getAllStudentVerifications();
  }

  @Patch(':id/review')
  reviewVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() review: ReviewStudentVerificationDto,
  ): Promise<StudentVerifications> {
    return this.studentVerificationService.reviewStudentVerification(
      id,
      review,
    );
  }

  @Delete(':id')
  deleteVerification(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.studentVerificationService.deleteStudentVerification(id);
  }

  @Delete('soft/:id')
  deleteVerificationSoft(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.studentVerificationService.deleteStudentVerificationSoft(id);
  }
}
