import {
  Body,
  Controller,
  Get,
  ParseUUIDPipe,
  Post,
  Param,
  Patch,
  Put,
  Delete,
} from '@nestjs/common';
import { StudentProfileService } from './student-profile.service.js';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto.js';
import { StudentProfiles } from './entity/student-profile.entity.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';

@Controller('student-profile')
export class StudentProfileController {
  constructor(private readonly studentProfileService: StudentProfileService) {}

  @Post()
  createProfile(
    @Body() profile: CreateStudentProfileDto,
  ): Promise<StudentProfiles> {
    return this.studentProfileService.createStudentProfile(profile);
  }

  @Get(':id')
  getProfile(@Param('id', ParseUUIDPipe) id: string): Promise<StudentProfiles> {
    return this.studentProfileService.getStudentProfileById(id);
  }

  @Get()
  getAllProfiles(): Promise<StudentProfiles[]> {
    return this.studentProfileService.getAllStudentProfiles();
  }

  @Patch(':id')
  updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfile: UpdateStudentProfileDto,
  ): Promise<StudentProfiles> {
    return this.studentProfileService.updateStudentProfile(id, updateProfile);
  }

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

  @Delete(':id')
  deleteProfile(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.studentProfileService.deleteStudentProfile(id);
  }
  @Delete('soft/:id')
  deleteProfileSoft(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.studentProfileService.deleteStudentProfileSoft(id);
  }
}
