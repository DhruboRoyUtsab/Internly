import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../users/entity/user.entity.js';

@Entity('recruiter_profile')
export class RecruiterProfileEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  recruiterId: string;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ImageURL: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  bio: string | null;
}
