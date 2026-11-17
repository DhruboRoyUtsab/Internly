import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('applications')
@Index(
  'UQ_applications_student_profile_internship',
  ['studentProfileId', 'internshipId'],
  { unique: true },
)
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_profile_id', type: 'uuid' })
  studentProfileId: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @Column({ name: 'cover_letter_text', type: 'text' })
  coverLetterText: string;

  @Column({
    name: 'resume_file_id',
    type: 'uuid',
    nullable: true,
  })
  resumeFileId: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'APPLIED',
  })
  status: string;

  @Column({
    name: 'applied_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  appliedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}