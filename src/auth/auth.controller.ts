import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterStudentDto } from './dto/register-student.dto.js';
import { Users } from '../users/entity/user.entity.js';
import { RegisterRecruiterDto } from './dto/register-recruiter.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { JwtGuard } from './jwtGuard.guard.js';

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

  @Post('verify-email')
  verifyEmail(@Body() verify:VerifyEmailDto):Promise<{email:string}>{
    return this.authService.verifyEmail(verify);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgot:ForgotPasswordDto):Promise<string>{
    return this.authService.forgotPassword(forgot);
  }

  @Post('reset-password')
  resetPassword(@Body() reset:ResetPasswordDto):Promise<string>{
    return this.authService.resetPassword(reset);
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  changePassword(@Body() change:ChangePasswordDto, @Req() req: {user:Users}):Promise<string>{
    return this.authService.changePassword(change, req.user);
  }

  
}
