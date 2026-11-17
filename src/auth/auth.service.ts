import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entity/user.entity.js';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterStudentDto } from './dto/register-student.dto.js';
import { RegisterRecruiterDto } from './dto/register-recruiter.dto.js';
import bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto.js';
import {
  ACCESS_TOKEN_EXPIRES,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
} from './auth.constants.js';
import { JwtPayload } from './jwtStrategy.strategy.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { randomToken, sha256 } from './token.util.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { MailService } from '../mail/mail.service.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

const TOKEN_EXPIRES_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async register(
    reg: RegisterStudentDto | RegisterRecruiterDto,
    role: string,
  ): Promise<Users> {
    const mail = await this.userRepo.findOneBy({
      email: reg.email.toLowerCase(),
    });
    if (mail) {
      throw new ConflictException('Email already Exists!');
    }

    const token = randomToken();
    try {
      const user = this.userRepo.create({
        fullName: reg.fullName,
        email: reg.email.toLowerCase(),
        passwordHash: await bcrypt.hash(reg.password, 16),
        role,
        emailVerificationTokenHash: sha256(token),
        emailVerificationExpiresAt: new Date(Date.now() + TOKEN_EXPIRES_MS),
      });
      const saved = await this.userRepo.save(user);

      await this.mailService.send(
        saved.email,
        'Verify your Internly Account',
        `<p>Hi ${saved.fullName},</p><p>Your Verification Token: </p><p><b>${token}</b></p>`,
      );

      const { passwordHash: _hash, ...safeUser } = saved;
      return safeUser as Users;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to register user due to DB Error!!!',
      );
    }
  }
  async registerStudent(stu: RegisterStudentDto): Promise<Users> {
    return this.register(stu, 'STUDENT');
  }

  async registerRecruiter(stu: RegisterRecruiterDto): Promise<Users> {
    return this.register(stu, 'RECRUITER');
  }

  async login(
    log: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findOne({
      where: { email: log.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        passwordHash: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const matchPass = await bcrypt.compare(log.password, user.passwordHash);
    if (!matchPass) {
      throw new UnauthorizedException('Invalid Email or Password');
    }
    return this.issueToken(user);
  }

  async refreshToken(
    ref: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(ref.refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or Expired Refresh Token!');
    }

    const user = await this.userRepo.findOneBy({ id: payload.id });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.issueToken(user);
  }

  async verifyEmail(mail: VerifyEmailDto): Promise<{ email: string }> {
    const user = await this.userRepo.findOneBy({
      emailVerificationTokenHash: sha256(mail.token),
    });

    if (!user) {
      throw new BadRequestException('Invalid or Expired Token!');
    }
    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification Token has Expired!');
    }

    await this.userRepo.update(
      {
        id: user.id,
      },
      {
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    );
    return { email: user.email };
  }

  async forgotPassword(pass: ForgotPasswordDto): Promise<string> {
    const user = await this.userRepo.findOneBy({
      email: pass.email.toLowerCase(),
    });

    if (user) {
      const token = randomToken();
      await this.userRepo.update(
        {
          id: user.id,
        },
        {
          emailVerificationTokenHash: sha256(token),
          emailVerificationExpiresAt: new Date(Date.now() + TOKEN_EXPIRES_MS),
        },
      );
      await this.mailService.send(
        user.email,
        'Reset your password',
        `<p>Your password reset token:</p><p><b>${token}</b></p>`,
      );
    }

    return 'A Reset token has been sent';
  }

  async resetPassword(reset: ResetPasswordDto): Promise<string> {
    const user = await this.userRepo.findOneBy({
      emailVerificationTokenHash: sha256(reset.token),
    });

    if (!user) {
      throw new BadRequestException('Invalid or Expired Token!');
    }
    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt < new Date()
    ) {
      throw new BadRequestException('Reset Token has Expired!');
    }

    await this.userRepo.update(
      {
        id: user.id,
      },
      {
        passwordHash: await bcrypt.hash(reset.password, 16),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    );
    return 'Password has been reset Successfully!';
  }

  async changePassword(
    change: ChangePasswordDto,
    user: Users,
  ): Promise<string> {
    const found = await this.userRepo.findOne({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        passwordHash: true,
      },
    });
    if (!found) {
      throw new UnauthorizedException('User no longer Exists!');
    }
    const matchPass = await bcrypt.compare(
      change.currentPassword,
      found.passwordHash,
    );
    if (!matchPass) {
      throw new BadRequestException('Current password is Incorrect!');
    }
    await this.userRepo.update(
      { id: found.id },
      { passwordHash: await bcrypt.hash(change.newPassword, 16) },
    );

    return 'Password updated Successfully';
  }

  private issueToken(user: Users): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = { id: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });

    return { accessToken, refreshToken };
  }
}
