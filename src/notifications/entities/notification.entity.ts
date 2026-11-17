import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('notification')
@Index('IDX_notifications_recipient_read',[
    'recipientUserId',
    'isRead', 
])

export class Notification{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'recipient_user_id',
        type: 'uuid',
    })
    recipientUserId!: string;

    @Column({
        type: 'varchar',
        length: 50,
    })
    type!: string;
    
    @Column({
        type: 'varchar',
        length: 200,
    })
    title!: string;

    @Column({
        type: 'text',
    })
    message!: string;

    @Column({
        name: 'related_entity_id',
        type: 'uuid',
        nullable: true,
    })
    relatedEntityId!: string|null;

    @Column({
        name: 'is_read',
        type: 'boolean',
        default: false,
    })
    isRead!: boolean;

    @Column({
        name: 'read_at',
        type: 'timestamptz',
        nullable: true,
    })
    readAt!: Date|null;

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