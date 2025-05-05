import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Thread } from './Thread';

@Entity({ name: 'Category' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 0 })
  order!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Category, category => category.children, { nullable: true })
  parent!: Category | null;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  @OneToMany(() => Thread, thread => thread.category)
  threads!: Thread[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 