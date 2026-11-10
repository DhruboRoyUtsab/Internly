import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';

/** STUB - replaced by Member 1's UsersModule. Registers the User entity so relations resolve. */
@Module({ imports: [TypeOrmModule.forFeature([User])], exports: [TypeOrmModule] })
export class UsersStubModule {}
