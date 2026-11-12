import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterStudentDto } from './dto/register-student.dto.js';
import { Users } from '../users/entity/user.entity.js';
import { RegisterRecruiterDto } from './dto/register-recruiter.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/student')
  registerStudent(@Body() student: RegisterStudentDto): Promise<Users> {
    return this.authService.registerStudent(student);
  }

  @Post('register/recruiter')
  registerRecruiter(@Body() recruiter: RegisterRecruiterDto): Promise<Users> {
    return this.authService.registerRecruiter(recruiter);
  }

  @Post('login')
  login(
    @Body() log: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(log);
  }

  @Post('refresh')
  refresh(
    @Body() ref: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.refreshToken(ref);
  }
}
