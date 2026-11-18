import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'k.bishal.paul@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
