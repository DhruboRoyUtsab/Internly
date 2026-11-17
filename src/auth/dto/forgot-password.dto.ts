import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'dhrubo@aiub.edu' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
