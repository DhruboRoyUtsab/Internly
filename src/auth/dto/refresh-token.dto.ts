import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: '<Refresh token received from /auth/login>' })
  @IsNotEmpty()
  @IsString()
  @MinLength(16)
  refreshToken: string;
}
