import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Thread } from './Thread';
import { Reaction } from './Reaction';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  content!: string;

  @Column('int', { default: 0 })
  reactionCount!: number;

  @ManyToOne(() => User, user => user.posts)
  user!: User;

  @ManyToOne(() => Thread, thread => thread.posts)
  thread!: Thread;

  @ManyToOne(() => Post, post => post.replies, { nullable: true })
  parent?: Post;

  @OneToMany(() => Post, post => post.parent)
  replies!: Post[];

  @OneToMany(() => Reaction, reaction => reaction.post)
  reactions!: Reaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 