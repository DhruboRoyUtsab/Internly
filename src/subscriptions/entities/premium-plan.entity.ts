import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('premium_plans')
export class PremiumPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 4.99 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 20, default: 'MONTHLY' })
  billingCycle: string;

  @Column({ name: 'stripe_price_id', type: 'varchar', length: 100, nullable: true })
  stripePriceId: string | null;

  @Column({ name: 'stripe_product_id', type: 'varchar', length: 100, nullable: true })
  stripeProductId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
