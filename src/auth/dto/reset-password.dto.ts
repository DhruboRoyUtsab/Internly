import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '<token from the reset email>' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'N3wStrongPass' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters!' })
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, {
    message:
      'Password must contain an uppercase letter, a lowercase letter and a digit!',
  })
  password: string;
}
