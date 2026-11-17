import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStudentVerificationDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  documentUrl: string;
}
