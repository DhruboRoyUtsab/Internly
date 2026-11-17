import { PartialType } from '@nestjs/swagger';
import { CreateStudentProfileDto } from './create-student-profile.dto.js';

/** Swagger-aware PartialType: inherited fields appear in /api/docs. */
export class UpdateStudentProfileDto extends PartialType(
  CreateStudentProfileDto,
) {}
