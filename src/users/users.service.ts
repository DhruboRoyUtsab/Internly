import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from './entity/user.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}

  async createUser(users: CreateUserDto): Promise<Users> {
    const usr = await this.userRepo.findOneBy({
      email: users.email.toLowerCase(),
    });

    if (usr) {
      throw new ConflictException('Email already exist');
    }
    try {
      const user = this.userRepo.create({
        ...users,
        email: users.email.toLowerCase(),
      });

      return await this.userRepo.save(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user due to DB Error');
    }
  }

  async getAllUser(): Promise<Users[]> {
    return await this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getUserById(id: string): Promise<Users> {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(
    id: string,
    updateUser: UpdateUserDto,
  ): Promise<Users | string> {
    const usr = await this.getUserById(id);

    if (usr) {
      const res = (await this.userRepo.update(id, updateUser)).affected;

      if (res != null && res > 0) {
        const user = await this.getUserById(id);
        return user;
      } else {
        return 'User not Found';
      }
    } else {
      throw new BadRequestException('User not Found');
    }
  }

  async replaceUser(
    id: string,
    updateUser: UpdateUserDto,
  ): Promise<Users | string> {
    const usr = await this.getUserById(id);

    if (usr) {
      const res = (await this.userRepo.update(id, updateUser)).affected;

      if (res != null && res > 0) {
        const user = await this.getUserById(id);
        return user;
      } else {
        return 'User not Found';
      }
    } else {
      throw new BadRequestException('User not Found');
    }
  }

  async deleteUser(id: string): Promise<string> {
    const res = (await this.userRepo.delete(id)).affected;

    if (res != null && res > 0) {
      return `User deleted Successfully id ${id}`;
    } else {
      return 'User not Found';
    }
  }

  async deleteUserSoft(id: string): Promise<string> {
    const res = (await this.userRepo.softDelete(id)).affected;

    if (res != null && res > 0) {
      return `User deleted Successfully id ${id}`;
    } else {
      return 'User not Found';
    }
  }
}
