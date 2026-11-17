import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminUsersService } from './admin-users.service.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Users } from '../users/entity/user.entity.js';
import { UpdateUserRoleDto } from '../users/dto/update-user-role.dto.js';
import {
  AdminListUserDto,
  PaginationMeta,
} from '../users/dto/admin-list-users.dto.js';

@ApiTags('Admin: Users')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @ApiOperation({ summary: 'List users with search, role/status filters and pagination' })
  @Get()
  listUsers(
    @Query() query: AdminListUserDto,
  ): Promise<{ items: Users[]; meta: PaginationMeta }> {
    return this.adminUsersService.listUsers(query);
  }

  @ApiOperation({ summary: 'Change a user role (admins cannot change their own)' })
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserRoleDto,
    @Req() req: { user: Users },
  ): Promise<Users> {
    return this.adminUsersService.updateRole(id, body.role, req.user.id);
  }

  @ApiOperation({ summary: 'Suspend a user (admins cannot suspend themselves)' })
  @Patch(':id/suspend')
  suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: Users },
  ): Promise<Users> {
    return this.adminUsersService.setStatus(id, 'SUSPENDED', req.user.id);
  }

  @ApiOperation({ summary: 'Reactivate a suspended user' })
  @Patch(':id/activate')
  activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: Users },
  ): Promise<Users> {
    return this.adminUsersService.setStatus(id, 'ACTIVE', req.user.id);
  }
}
