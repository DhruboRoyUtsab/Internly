import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;
}
