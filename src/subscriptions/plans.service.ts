import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PremiumPlan } from './entities/premium-plan.entity.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';

@Injectable()
export class PlansService implements OnModuleInit {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(PremiumPlan)
    private readonly planRepository: Repository<PremiumPlan>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPremiumPlan();
  }

  private async seedDefaultPremiumPlan(): Promise<void> {
    const existing = await this.planRepository.findOne({
      where: { name: 'Premium Student Plan' },
    });

    if (!existing) {
      const defaultPlan = this.planRepository.create({
        name: 'Premium Student Plan',
        description:
          'Unlock premium internship recommendations, application insights, and direct recruiter access.',
        price: 4.99,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        isActive: true,
      });

      await this.planRepository.save(defaultPlan);
      this.logger.log('Default $4.99/mo Premium Student Plan seeded successfully.');
    }
  }

  async create(createPlanDto: CreatePlanDto): Promise<PremiumPlan> {
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async findAllActive(): Promise<PremiumPlan[]> {
    return await this.planRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async findAll(): Promise<PremiumPlan[]> {
    return await this.planRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PremiumPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID "${id}" was not found.`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<PremiumPlan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return await this.planRepository.save(plan);
  }

  async remove(id: string): Promise<{ message: string }> {
    const plan = await this.findOne(id);
    plan.isActive = false;
    await this.planRepository.save(plan);
    return { message: `Plan "${plan.name}" has been deactivated successfully.` };
  }
}
