import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: string;

  @ManyToOne(() => User, user => user.reactions)
  user!: User;

  @ManyToOne(() => Post, post => post.reactions)
  post!: Post;

  @CreateDateColumn()
  createdAt!: Date;
} 