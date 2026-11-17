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

@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listUsers(
    @Query() query: AdminListUserDto,
  ): Promise<{ items: Users[]; meta: PaginationMeta }> {
    return this.adminUsersService.listUsers(query);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserRoleDto,
    @Req() req: { user: Users },
  ): Promise<Users> {
    return this.adminUsersService.updateRole(id, body.role, req.user.id);
  }

  @Patch(':id/suspend')
  suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: Users },
  ): Promise<Users> {
    return this.adminUsersService.setStatus(id, 'SUSPENDED', req.user.id);
  }

  @Patch(':id/activate')
  activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: Users },
  ): Promise<Users> {
    return this.adminUsersService.setStatus(id, 'ACTIVE', req.user.id);
  }
}
