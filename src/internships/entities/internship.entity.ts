import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  InternshipStatus,
  InternshipVisibility,
  WorkMode,
} from '../enums/internships.enum.js';
import { RecruiterProfileEntities } from '../../recruiters/entities/recruiter.profile.entities.js';

@Entity('internships')
export class Internship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RecruiterProfileEntities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: RecruiterProfileEntities;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 150 })
  companyName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'enum', enum: WorkMode, default: WorkMode.ONSITE })
  workMode: WorkMode;

  @Column({ type: 'varchar', length: 50, nullable: true })
  duration: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  stipend: number | null;

  @Column({ type: 'int', default: 1 })
  openings: number;

  @Column({ type: 'text', nullable: true })
  skills: string | null;

  @Column({ type: 'enum', enum: InternshipStatus, default: InternshipStatus.ACTIVE })
  status: InternshipStatus;

  @Column({
    type: 'enum',
    enum: InternshipVisibility,
    default: InternshipVisibility.STANDARD,
  })
  visibility: InternshipVisibility;

  @Column({ type: 'timestamptz' })
  deadline: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
