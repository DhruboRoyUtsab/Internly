import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterStudentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, {
    message:
      'Password must contain an uppercase letter, a lowercase letter and a digit',
  })
  password: string;
}
