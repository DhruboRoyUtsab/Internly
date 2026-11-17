import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('saved_internships')
@Index(
  'UQ_saved_internships_student_internship',
  ['studentProfileId', 'internshipId'],
  { unique: true },
)
export class SavedInternship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'student_profile_id',
    type: 'uuid',
  })
  studentProfileId!: string;

  @Column({
    name: 'internship_id',
    type: 'uuid',
  })
  internshipId!: string;

  @CreateDateColumn({
    name: 'saved_at',
    type: 'timestamptz',
  })
  savedAt!: Date;
}
