import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PremiumEntitlementService } from './premium-entitlement.service.js';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum.js';
import { ForbiddenException } from '@nestjs/common';

describe('PremiumEntitlementService', () => {
  let service: PremiumEntitlementService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findOne: vi.fn(),
    };
    service = new PremiumEntitlementService(mockRepository);
  });

  it('should return false if userId is not provided', async () => {
    const result = await service.isStudentPremium('');
    expect(result).toBe(false);
  });

  it('should return true when student has an active subscription', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);

    mockRepository.findOne.mockResolvedValue({
      id: 'sub-1',
      userId: 'user-123',
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: futureDate,
    });

    const result = await service.isStudentPremium('user-123');
    expect(result).toBe(true);
  });

  it('should return false when student has no subscription', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const result = await service.isStudentPremium('user-456');
    expect(result).toBe(false);
  });

  it('should throw ForbiddenException in assertPremium when student is not premium', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.assertPremium('user-999')).rejects.toThrow(ForbiddenException);
  });
});
