import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReviewStudentVerificationDto {
  @IsIn(['APPROVED', 'REJECTED'], {
    message: 'Status must be APPROVED or REJECTED',
  })
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  adminNote?: string;

}
