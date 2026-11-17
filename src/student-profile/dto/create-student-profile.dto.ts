import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: '<uuid of the user this profile belongs to>' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'Metropolitan University' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  institution?: string;

  @ApiPropertyOptional({ example: 'BSc in Computer Science' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  degreeProgram?: string;

  @ApiPropertyOptional({ example: 'CSE' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  studyYear?: number;

  @ApiPropertyOptional({ example: 2027, minimum: 2000, maximum: 2100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  graduationYear?: number;

  @ApiPropertyOptional({ example: 'Java, SQL, NestJS' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  skills?: string;

  @ApiPropertyOptional({ example: 'Web development, databases' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  interests?: string;

  @ApiPropertyOptional({ example: 'https://github.com/rafi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  portfolioUrl?: string;
}
