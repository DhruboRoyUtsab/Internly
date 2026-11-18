import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum.js';
import { PaymentStatus } from '../common/enums/payment-status.enum.js';
import { NotFoundException } from '@nestjs/common';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let mockSubRepo: any;
  let mockPlanRepo: any;
  let mockPaymentRepo: any;
  let mockAuditLogsService: any;

  beforeEach(() => {
    mockSubRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      count: vi.fn(),
      save: vi.fn((s) => Promise.resolve(s)),
      createQueryBuilder: vi.fn(() => ({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      })),
    };

    mockPlanRepo = {
      findOne: vi.fn(),
    };

    mockPaymentRepo = {
      find: vi.fn(),
    };

    mockAuditLogsService = {
      log: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    service = new SubscriptionsService(
      mockSubRepo,
      mockPlanRepo,
      mockPaymentRepo,
      mockAuditLogsService,
    );
  });

  describe('cancelStudentSubscription (Student Cancellation at period end)', () => {
    it('should set cancelAtPeriodEnd to true and record audit log', async () => {
      mockSubRepo.findOne.mockResolvedValue({
        id: 'sub-123',
        userId: 'student-1',
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
      });

      const result = await service.cancelStudentSubscription('student-1');

      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(result.canceledAt).toBeDefined();
      expect(mockAuditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'SUBSCRIPTION_CANCELED',
          actorId: 'student-1',
        }),
      );
    });

    it('should throw NotFoundException if student has no active subscription', async () => {
      mockSubRepo.findOne.mockResolvedValue(null);

      await expect(service.cancelStudentSubscription('student-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAnalyticsOverview (Platform Billing Analytics & MRR)', () => {
    it('should calculate total revenue, active subscribers, and MRR accurately', async () => {
      mockSubRepo.count
        .mockResolvedValueOnce(10) // 10 active subscribers
        .mockResolvedValueOnce(15); // 15 total subscribers

      mockPaymentRepo.find.mockResolvedValue([
        { status: PaymentStatus.SUCCEEDED, amount: 4.99 },
        { status: PaymentStatus.SUCCEEDED, amount: 4.99 },
        { status: PaymentStatus.FAILED, amount: 4.99 },
        { status: PaymentStatus.REFUNDED, amount: 4.99, refundedAmount: 4.99 },
      ]);

      const analytics = await service.getAnalyticsOverview();

      expect(analytics.activeSubscribers).toBe(10);
      expect(analytics.totalSubscribers).toBe(15);
      expect(analytics.monthlyRecurringRevenue).toBe(49.9); // 10 * 4.99
      expect(analytics.successfulPayments).toBe(2);
      expect(analytics.failedPayments).toBe(1);
      expect(analytics.refundedAmount).toBe(4.99);
    });
  });
});
