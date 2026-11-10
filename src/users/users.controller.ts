import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { Users } from './entity/user.entity.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() user: CreateUserDto): Promise<Users> {
    return this.usersService.createUser(user);
  }

  @Get(':id')
  getUser(@Param('id', ParseUUIDPipe) id: string): Promise<Users> {
    return this.usersService.getUserById(id);
  }

  @Get()
  getAllUsers(): Promise<Users[]> {
    return this.usersService.getAllUser();
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUser: UpdateUserDto,
  ): Promise<Users | string> {
    return this.usersService.updateUser(id, updateUser);
  }

  @Put(':id')
  replaceUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUser: UpdateUserDto,
  ): Promise<Users | string> {
    return this.usersService.replaceUser(id, updateUser);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.usersService.deleteUser(id);
  }

  @Delete('soft/:id')
  deleteUserSoft(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.usersService.deleteUserSoft(id);
  }
}
