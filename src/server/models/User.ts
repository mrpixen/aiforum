import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Thread } from './Thread';
import { Post } from './Post';
import { Reaction } from './Reaction';
import { Notification } from './Notification';
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username!: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @Column({ default: 'user' })
  role!: 'user' | 'admin' | 'moderator';

  @Column({ default: false })
  isModerator!: boolean;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  bio?: string;

  @OneToMany(() => Thread, thread => thread.user)
  threads!: Thread[];

  @OneToMany(() => Post, post => post.user)
  posts!: Post[];

  @OneToMany(() => Reaction, reaction => reaction.user)
  reactions!: Reaction[];

  @OneToMany(() => Notification, notification => notification.recipient)
  notifications!: Notification[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 