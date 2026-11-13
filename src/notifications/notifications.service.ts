import { Injectable } from '@nestjs/common';
import { NotificationQueryDto } from './dto/notification-query.dto.js';

@Injectable()
export class NotificationsService {
  findAll(query: NotificationQueryDto) {
    return {
      message:
        'Notification retrieval will be implemented with database integration.',
      query,
    };
  }

  markAsRead(id: string) {
    return {
      message:
        'Mark notification as read will be implemented with database integration.',
      notificationId: id,
    };
  }
}
