import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import { PaymentStatus } from '../common/enums/payment-status.enum.js';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentRepo: any;
  let mockStripeEventRepo: any;
  let mockSubscriptionRepo: any;
  let mockPlanRepo: any;
  let mockUserRepo: any;
  let mockStripeService: any;
  let mockAuditLogsService: any;
  let mockDataSource: any;
  let mockQueryRunner: any;

  beforeEach(() => {
    mockPaymentRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      save: vi.fn((entity) => Promise.resolve({ id: 'payment-1', ...entity })),
      createQueryBuilder: vi.fn(() => ({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      })),
    };

    mockStripeEventRepo = {
      findOne: vi.fn(),
      create: vi.fn((e) => e),
      save: vi.fn((e) => Promise.resolve(e)),
    };

    mockSubscriptionRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((s) => s),
      save: vi.fn((s) => Promise.resolve({ id: 'sub-1', ...s })),
    };

    mockPlanRepo = {
      findOne: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
      create: vi.fn((u) => u),
      save: vi.fn((u) => Promise.resolve({ id: 'user-1', ...u })),
    };

    mockStripeService = {
      createCheckoutSession: vi.fn().mockResolvedValue({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.test/cs_test_123',
      }),
      constructWebhookEvent: vi.fn(),
      processRefund: vi.fn().mockResolvedValue({
        refundId: 're_123',
        amount: 4.99,
        status: 'succeeded',
      }),
    };

    mockAuditLogsService = {
      log: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    mockQueryRunner = {
      connect: vi.fn().mockResolvedValue(undefined),
      startTransaction: vi.fn().mockResolvedValue(undefined),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
      manager: {
        findOne: vi.fn(),
        create: vi.fn((_entity, data) => data),
        save: vi.fn((entity) => Promise.resolve({ id: 'saved-id', ...entity })),
      },
    };

    mockDataSource = {
      createQueryRunner: vi.fn(() => mockQueryRunner),
    };

    service = new PaymentsService(
      mockPaymentRepo,
      mockStripeEventRepo,
      mockSubscriptionRepo,
      mockPlanRepo,
      mockUserRepo,
      mockStripeService,
      mockAuditLogsService,
      mockDataSource,
    );
  });

  describe('processDemoPayment (1-Click Demo Pay)', () => {
    it('should execute multi-table transaction and activate subscription with $4.99 payment', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'student-123',
        email: 'student@internly.edu',
        emailVerified: true,
      });

      mockPlanRepo.findOne.mockResolvedValue({
        id: 'plan-499',
        name: 'Premium Student Plan',
        price: 4.99,
        currency: 'USD',
      });

      mockQueryRunner.manager.findOne.mockResolvedValue(null); // No previous subscription

      const result = await service.processDemoPayment('student-123', {});

      expect(result.success).toBe(true);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(3); // sub, payment, stripeEvent
      expect(mockAuditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DEMO_SUBSCRIPTION_ACTIVATED',
          actorId: 'student-123',
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('handleWebhook (Idempotency and Signature Processing)', () => {
    it('should be idempotent and skip already processed events', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue({
        id: 'evt_duplicate_123',
        type: 'checkout.session.completed',
      });

      mockStripeEventRepo.findOne.mockResolvedValue({
        id: 'evt_duplicate_123',
        status: 'PROCESSED',
      });

      const result = await service.handleWebhook('raw_payload', 'sig_123');

      expect(result.received).toBe(true);
      expect(result.message).toBe('Event already processed');
      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('should process new checkout.session.completed inside a transaction', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue({
        id: 'evt_new_456',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session',
            subscription: 'sub_stripe_1',
            customer: 'cus_stripe_1',
            metadata: {
              userId: 'student-123',
              planId: 'plan-499',
            },
          },
        },
      });

      mockStripeEventRepo.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce({ id: 'plan-499', price: 4.99, currency: 'USD' }) // Plan
        .mockResolvedValueOnce(null); // Existing sub

      const result = await service.handleWebhook('raw_payload', 'sig_123');

      expect(result.received).toBe(true);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('refundPayment (Admin Refund with Transaction)', () => {
    it('should process refund, update payment status to REFUNDED, and record audit log', async () => {
      mockPaymentRepo.findOne.mockResolvedValue({
        id: 'pay-123',
        amount: 4.99,
        refundedAmount: 0,
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: 'pi_test_123',
      });

      const result = await service.refundPayment(
        'pay-123',
        { amount: 4.99, reason: 'Course demo refund' },
        'admin-1',
        'admin@internly.edu',
      );

      expect(mockStripeService.processRefund).toHaveBeenCalledWith({
        paymentIntentId: 'pi_test_123',
        amount: 4.99,
        reason: 'Course demo refund',
      });
      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(mockAuditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PAYMENT_REFUNDED',
          actorRole: 'ADMIN',
        }),
      );
    });

    it('should reject refund if payment is already refunded', async () => {
      mockPaymentRepo.findOne.mockResolvedValue({
        id: 'pay-123',
        amount: 4.99,
        status: PaymentStatus.REFUNDED,
      });

      await expect(
        service.refundPayment('pay-123', {}, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
