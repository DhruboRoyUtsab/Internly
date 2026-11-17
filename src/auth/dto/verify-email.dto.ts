import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '<token from the verification email>' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
