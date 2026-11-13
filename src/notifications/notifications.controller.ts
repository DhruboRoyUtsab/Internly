import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationQueryDto } from './dto/notification-query.dto.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query() query: NotificationQueryDto) {
    return this.notificationsService.findAll(query);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string){
    return this.notificationsService.markAsRead(id);
  }
}
