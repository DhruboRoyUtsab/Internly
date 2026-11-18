import { Injectable, NotFoundException } from '@nestjs/common';
import { Users } from './entity/user.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}

  async getUserById(id: string): Promise<Users> {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<string> {
    const res = (await this.userRepo.delete(id)).affected;

    if (res != null && res > 0) {
      return `User deleted Successfully id ${id}`;
    }
    return 'User not Found';
  }

  async deleteUserSoft(id: string): Promise<string> {
    const res = (await this.userRepo.softDelete(id)).affected;

    if (res != null && res > 0) {
      return `User deleted Successfully id ${id}`;
    }
    return 'User not Found';
  }
}
