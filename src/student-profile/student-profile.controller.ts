import {
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Post,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentProfileService } from './student-profile.service.js';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto.js';
import { StudentProfiles } from './entity/student-profile.entity.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';

@ApiTags('Student Profiles')
@Controller('student-profile')
export class StudentProfileController {
  constructor(private readonly studentProfileService: StudentProfileService) {}

  @ApiOperation({ summary: 'Create a student profile (one per user)' })
  @Post()
  createProfile(
    @Body() profile: CreateStudentProfileDto,
  ): Promise<StudentProfiles> {
    return this.studentProfileService.createStudentProfile(profile);
  }

  @ApiOperation({ summary: 'Get one student profile by id' })
  @Get(':id')
  getProfile(@Param('id', ParseUUIDPipe) id: string): Promise<StudentProfiles> {
    return this.studentProfileService.getStudentProfileById(id);
  }

  @ApiOperation({ summary: 'List all student profiles (newest first)' })
  @Get()
  getAllProfiles(): Promise<StudentProfiles[]> {
    return this.studentProfileService.getAllStudentProfiles();
  }

  @ApiOperation({ summary: 'Partially update a student profile' })
  @Patch(':id')
  updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfile: UpdateStudentProfileDto,
  ): Promise<StudentProfiles> {
    return this.studentProfileService.updateStudentProfile(id, updateProfile);
  }

  @ApiOperation({ summary: 'Replace a student profile' })
  @Put(':id')
  replaceProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() replaceProfile: UpdateStudentProfileDto,
  ): Promise<StudentProfiles> {
    return this.studentProfileService.replaceStudentProfile(
      id,
      replaceProfile,
    );
  }

  @ApiOperation({ summary: 'Hard delete a student profile' })
  @Delete(':id')
  deleteProfile(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.studentProfileService.deleteStudentProfile(id);
  }

  @ApiOperation({ summary: 'Soft delete a student profile' })
  @Delete('soft/:id')
  deleteProfileSoft(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.studentProfileService.deleteStudentProfileSoft(id);
  }
}
