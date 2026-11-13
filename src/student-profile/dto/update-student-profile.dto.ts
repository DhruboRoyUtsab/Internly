import { CreateStudentProfileDto } from './create-student-profile.dto.js';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateStudentProfileDto extends PartialType(
  CreateStudentProfileDto,
) {}
