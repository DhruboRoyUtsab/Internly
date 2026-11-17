import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStudentVerificationDto {
  @ApiProperty({ example: '<uuid of the user requesting verification>' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'https://example.com/uploads/student-id.pdf',
    description: 'Reference to the submitted ID document',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  documentUrl: string;
}
