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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { Users } from './entity/user.entity.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @Post()
  createUser(@Body() user: CreateUserDto): Promise<Users> {
    return this.usersService.createUser(user);
  }

  @ApiOperation({ summary: 'Get one user by id' })
  @Get(':id')
  getUser(@Param('id', ParseUUIDPipe) id: string): Promise<Users> {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ summary: 'List all users (newest first)' })
  @Get()
  getAllUsers(): Promise<Users[]> {
    return this.usersService.getAllUser();
  }

  @ApiOperation({ summary: 'Partially update a user' })
  @Patch(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUser: UpdateUserDto,
  ): Promise<Users | string> {
    return this.usersService.updateUser(id, updateUser);
  }

  @ApiOperation({ summary: 'Replace a user' })
  @Put(':id')
  replaceUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUser: UpdateUserDto,
  ): Promise<Users | string> {
    return this.usersService.replaceUser(id, updateUser);
  }

  @ApiOperation({ summary: 'Hard delete a user (admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.usersService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Soft delete a user (admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('soft/:id')
  deleteUserSoft(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.usersService.deleteUserSoft(id);
  }
}
