import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';

import { Application } from './application.entity.js';

@Entity('application_status_history')
export class ApplicationStatusHistory{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(()=> Application,{
        onDelete: 'CASCADE',
    })
    @JoinColumn({name: 'application_id'})
    application!: Application;

    @RelationId((history: ApplicationStatusHistory) => history.application)
    applicatinId: string;

    @Column({
        name: 'from_status',
        type: 'varchar',
        length: 30,
        nullable: true,
    })
    fromStatus!: string|null;

    @Column({
        name: 'to_status',
        type: 'varchar',
        length: 30,
    })
    toStatus!: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    note!: string|null;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
    })
    createdAt!: Date;
}
