import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentProfileDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  institution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  degreeProgram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  studyYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  graduationYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  skills?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  interests?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  portfolioUrl?: string;
}
