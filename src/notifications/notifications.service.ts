import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity.js';
import { NotificationQueryDto } from './dto/notification-query.dto.js';
import type { AuthenticatedUser } from '../common/interfaces/authhenticated.user.interface.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(user: AuthenticatedUser, query: NotificationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.notificationsRepository.findAndCount({
      where: {
        recipientUserId: user.id,
        ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async unreadCount(user: AuthenticatedUser) {
    const count = await this.notificationsRepository.count({
      where: { recipientUserId: user.id, isRead: false },
    });

    return { unreadCount: count };
  }

  async markAsRead(user: AuthenticatedUser, id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, recipientUserId: user.id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationsRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(user: AuthenticatedUser) {
    const result = await this.notificationsRepository.update(
      { recipientUserId: user.id, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return {
      message: 'All notifications marked as read.',
      updated: result.affected ?? 0,
    };
  }

  async remove(user: AuthenticatedUser, id: string) {
    const result = await this.notificationsRepository.delete({
      id,
      recipientUserId: user.id,
    });

    if (!result.affected) {
      throw new NotFoundException('Notification not found.');
    }
  }
}
