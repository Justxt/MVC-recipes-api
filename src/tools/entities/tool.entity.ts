import { Recipe } from 'src/recipes/entities/recipe.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToMany,
} from 'typeorm';

@Entity('tools')
export class Tool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ManyToMany(() => Recipe, (recipe) => recipe.requiredTools)
  recipes: Recipe[];

  @ManyToMany(() => User, (user) => user.ownedTools)
  users?: User[];
}
