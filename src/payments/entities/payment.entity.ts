import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Subscription } from '../../subscriptions/entities/subscription.entity.js';
import { PaymentStatus } from '../../common/enums/payment-status.enum.js';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'subscription_id', type: 'uuid', nullable: true })
  subscriptionId: string | null;

  @ManyToOne(() => Subscription, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Index({ unique: true })
  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 100, nullable: true })
  stripePaymentIntentId: string | null;

  @Column({ name: 'stripe_invoice_id', type: 'varchar', length: 100, nullable: true })
  stripeInvoiceId: string | null;

  @Index()
  @Column({ name: 'stripe_checkout_session_id', type: 'varchar', length: 150, nullable: true })
  stripeCheckoutSessionId: string | null;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'card' })
  paymentMethod: string;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl: string | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({
    name: 'refunded_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  refundedAmount: number;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
