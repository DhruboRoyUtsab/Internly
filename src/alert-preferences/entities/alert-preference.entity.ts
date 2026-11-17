import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alert_preferences')
@Index('UQ_alert_preferences_student_profile', ['studentProfileId'], {
  unique: true,
})
export class AlertPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'student_profile_id',
    type: 'uuid',
  })
  studentProfileId: string;

  @Column({
    name: 'email_enabled',
    type: 'boolean',
    default: true,
  })
  emailEnabled!: boolean;

  @Column({
    name: 'in_app_enabled',
    type: 'boolean',
    default: true,
  })
  inAppEnabled!: boolean;

  @Column({
    name: 'application_updates',
    type: 'boolean',
    default: true,
  })
  applicationUpdates!: boolean;

  @Column({
    name: 'internship_alerts',
    type: 'boolean',
    default: true,
  })
  internshipAlerts!: boolean;

  @Column({
    name: 'marketing_emails',
    type: 'boolean',
    default: false,
  })
  marketingEmails!: boolean;

  @UpdateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
