import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../users/entity/user.entity.js';
import {
  AdminListUserDto,
  PaginationMeta,
} from '../users/dto/admin-list-users.dto.js';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}

  async listUsers(
    query: AdminListUserDto,
  ): Promise<{ items: Users[]; meta: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.role) {
      qb.andWhere('u.role = :role', { role: query.role });
    }
    if (query.status) {
      qb.andWhere('u.status = :status', { role: query.status });
    }
    if (query.q) {
      qb.andWhere('(u.email ILIKE :q OR u.fullName ILIKE :q)', {
        q: `%&{query.q}`,
      });
    }
    const [users, total] = await qb.getManyAndCount();

    return {
      items: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async updateRole(id: string, role: string, adminId: string): Promise<Users> {
    if (id === adminId) {
      throw new BadRequestException('You can not change your own role');
    }
    await this.getById(id);
    await this.userRepo.update({ id }, { role });
    return this.getById(id);
  }

  async setStatus(id: string, status: string, adminId: string): Promise<Users> {
    if (id === adminId && status === 'SUSPENDED') {
      throw new BadRequestException('You cannot suspend your own account');
    }
    await this.getById(id);

    await this.userRepo.update({ id }, { status });

    return this.getById(id);
  }

  private async getById(id: string): Promise<Users> {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
