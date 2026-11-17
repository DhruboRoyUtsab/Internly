import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new student account' })
  @Post('register/student')
  registerStudent(@Body() student: RegisterStudentDto): Promise<Users> {
    return this.authService.registerStudent(student);
  }

  @ApiOperation({ summary: 'Register a new recruiter account' })
  @Post('register/recruiter')
  registerRecruiter(@Body() recruiter: RegisterRecruiterDto): Promise<Users> {
    return this.authService.registerRecruiter(recruiter);
  }

  @ApiOperation({ summary: 'Log in — returns access + refresh tokens' })
  @Post('login')
  login(
    @Body() log: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(log);
  }

  @ApiOperation({ summary: 'Rotate tokens using a refresh token' })
  @Post('refresh')
  refresh(
    @Body() ref: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.refreshToken(ref);
  }

  @ApiOperation({ summary: 'Verify the account email with the mailed token' })
  @Post('verify-email')
  verifyEmail(@Body() verify: VerifyEmailDto): Promise<{ email: string }> {
    return this.authService.verifyEmail(verify);
  }

  @ApiOperation({ summary: 'Request a password reset token by email' })
  @Post('forgot-password')
  forgotPassword(@Body() forgot: ForgotPasswordDto): Promise<string> {
    return this.authService.forgotPassword(forgot);
  }

  @ApiOperation({ summary: 'Set a new password using the reset token' })
  @Post('reset-password')
  resetPassword(@Body() reset: ResetPasswordDto): Promise<string> {
    return this.authService.resetPassword(reset);
  }

  @ApiOperation({ summary: 'Change password (requires login)' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('change-password')
  changePassword(
    @Body() change: ChangePasswordDto,
    @Req() req: { user: Users },
  ): Promise<string> {
    return this.authService.changePassword(change, req.user);
  }
}
