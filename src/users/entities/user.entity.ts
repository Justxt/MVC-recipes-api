import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tool } from '../../tools/entities/tool.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password_hash: string;

  @Column({
    type: 'simple-array',
    nullable: true,
    comment: 'Ej: vegano, sin_gluten, alergia_lactosa',
  })
  dietary_restrictions?: string[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: 'principiante',
  })
  cooking_level?: string;

  @ManyToMany(() => Tool, { eager: false })
  @JoinTable({
    name: 'user_owned_tools',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tool_id', referencedColumnName: 'id' },
  })
  ownedTools?: Tool[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  get password(): string {
    return this.password_hash;
  }

  set password(pass: string) {
    this.password_hash = pass;
  }
}
