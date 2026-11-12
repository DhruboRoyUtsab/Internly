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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
    private readonly jwtService: JwtService,
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
    try {
      const user = this.userRepo.create({
        fullName: reg.fullName,
        email: reg.email.toLowerCase(),
        passwordHash: await bcrypt.hash(reg.password, 16),
        role,
      });
      const saved = await this.userRepo.save(user);

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
