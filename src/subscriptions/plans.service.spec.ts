import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlansService } from './plans.service.js';
import { NotFoundException } from '@nestjs/common';

describe('PlansService', () => {
  let service: PlansService;
  let mockPlanRepo: any;

  beforeEach(() => {
    mockPlanRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((dto) => dto),
      save: vi.fn(async (plan) => ({ id: 'plan-1', ...plan })),
    };
    service = new PlansService(mockPlanRepo);
  });

  it('should seed default $4.99/mo plan if not found on startup', async () => {
    mockPlanRepo.findOne.mockResolvedValue(null);

    await service.onModuleInit();

    expect(mockPlanRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Premium Student Plan',
        price: 4.99,
        currency: 'USD',
        billingCycle: 'MONTHLY',
      }),
    );
    expect(mockPlanRepo.save).toHaveBeenCalled();
  });

  it('should not seed if default plan already exists', async () => {
    mockPlanRepo.findOne.mockResolvedValue({ id: 'plan-existing', name: 'Premium Student Plan' });

    await service.onModuleInit();

    expect(mockPlanRepo.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if plan does not exist', async () => {
    mockPlanRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
