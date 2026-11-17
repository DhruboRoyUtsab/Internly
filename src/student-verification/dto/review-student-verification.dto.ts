import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewStudentVerificationDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'], {
    message: 'Status must be APPROVED or REJECTED',
  })
  status: string;

  @ApiPropertyOptional({ example: 'ID document looks valid' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  adminNote?: string;
}
