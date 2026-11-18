import { Controller, Delete, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { Users } from './entity/user.entity.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Own user account (from the JWT token)' })
  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: { user: Users }): Users {
    return req.user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hard delete a user (admin only)' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.usersService.deleteUser(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a user (admin only)' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('soft/:id')
  deleteUserSoft(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.usersService.deleteUserSoft(id);
  }
}
