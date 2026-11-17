import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entity/user.entity.js';
import { AdminUsersService } from './admin-users.service.js';
import { AdminUsersController } from './admin-users.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
