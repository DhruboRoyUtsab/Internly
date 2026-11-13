import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../users/entity/user.entity.js';
import type { Relation } from 'typeorm';

@Entity('student_profiles')
export class StudentProfiles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<Users>;

  @Column({ type: 'varchar', length: 150, nullable: true })
  institution: string;

  @Column({
    name: 'degree_program',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  degreeProgram: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ name: 'study_year', type: 'int', nullable: true })
  studyYear: number;

  @Column({ name: 'graduation_year', type: 'int', nullable: true })
  graduationYear: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  skills: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  interests: string;

  @Column({
    name: 'portfolio_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  portfolioUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deleteAt: Date;
}
