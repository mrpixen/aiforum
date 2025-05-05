import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Post } from './Post';
import { Thread } from './Thread';

export enum NotificationType {
  NEW_POST = 'NEW_POST',
  NEW_THREAD = 'NEW_THREAD',
  NEW_REPLY = 'NEW_REPLY',
  MENTION = 'MENTION',
  REACTION = 'REACTION'
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type!: NotificationType;

  @Column('text')
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @ManyToOne(() => User, user => user.notifications)
  recipient!: User;

  @ManyToOne(() => User, { nullable: true })
  sender?: User;

  @ManyToOne(() => Post, { nullable: true })
  post?: Post;

  @ManyToOne(() => Thread, { nullable: true })
  thread?: Thread;

  @CreateDateColumn()
  createdAt!: Date;
} 