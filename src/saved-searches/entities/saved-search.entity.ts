import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('saved_searches')
@Index('IDX_saved_searches_student_profile', ['studentProfileId'])
export class SavedSearch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'student_profile_id',
    type: 'uuid',
  })
  studentProfileId!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    type: 'jsonb',
  })
  filters!: Record<string, any>;

  @Column({
    name: 'alert_enabled',
    type: 'boolean',
    default: false,
  })
  alertEnabled!: boolean;

  @CreateDateColumn({
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
