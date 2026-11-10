import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  InternshipVisibility,
  WorkMode,
} from '../enums/internships.enum.js';

export class CreateInternshipDto {
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  companyName: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string | null;

  @IsEnum(WorkMode, { message: 'workMode must be one of ONSITE, REMOTE, HYBRID' })
  workMode: WorkMode;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  duration?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'stipend must be a valid amount' })
  @Min(0)
  @Max(1000000)
  stipend?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  openings?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  skills?: string | null;

  @IsOptional()
  @IsEnum(InternshipVisibility, {
    message: 'visibility must be one of STANDARD, PREMIUM_EXCLUSIVE',
  })
  visibility?: InternshipVisibility;

  @IsDateString({}, { message: 'deadline must be a valid ISO date string' })
  deadline: string;
}
