import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogsService } from './audit-logs.service.js';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let mockAuditLogRepo: any;

  beforeEach(() => {
    mockAuditLogRepo = {
      create: vi.fn((data) => data),
      save: vi.fn((data) => Promise.resolve({ id: 'audit-log-1', ...data })),
      findOne: vi.fn(),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([
          [
            {
              id: 'audit-1',
              action: 'SUBSCRIPTION_ACTIVATED',
              actorRole: 'STUDENT',
              entityName: 'Subscription',
            },
          ],
          1,
        ]),
      })),
    };

    service = new AuditLogsService(mockAuditLogRepo);
  });

  it('should record an audit log successfully', async () => {
    const log = await service.log({
      actorId: 'user-1',
      actorRole: 'ADMIN',
      action: 'PAYMENT_REFUNDED',
      entityName: 'Payment',
      entityId: 'pay-1',
      newValues: { status: 'REFUNDED' },
    });

    expect(mockAuditLogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PAYMENT_REFUNDED',
        entityName: 'Payment',
      }),
    );
    expect(log).toHaveProperty('id');
  });

  it('should list and filter audit logs for admin viewing', async () => {
    const result = await service.findAll({ action: 'SUBSCRIPTION', page: 1, limit: 10 });

    expect(result.total).toBe(1);
    expect(result.data.length).toBe(1);
    expect(result.data[0].action).toBe('SUBSCRIPTION_ACTIVATED');
  });
});
