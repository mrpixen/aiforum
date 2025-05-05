import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Post } from './Post';
import { Tag } from './Tag';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column({ default: 0 })
  viewCount!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isLocked!: boolean;

  @Column({ default: false })
  isPinned!: boolean;

  @ManyToOne(() => User, user => user.threads)
  user!: User;

  @ManyToOne(() => Category, category => category.threads)
  category!: Category;

  @OneToMany(() => Post, post => post.thread)
  posts!: Post[];

  @ManyToMany(() => Tag, tag => tag.threads)
  @JoinTable()
  tags!: Tag[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 