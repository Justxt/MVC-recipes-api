import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { Tool } from 'src/tools/entities/tool.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'preparation_time_minutes' })
  preparationTimeMinutes: number;

  @Column({ name: 'cooking_time_minutes' })
  cookingTimeMinutes: number;

  @Column()
  servings: number;

  @Column({
    type: 'text',
    array: true,
    nullable: false,
    comment: 'Step-by-step preparation instructions',
  })
  steps: string[];

  @OneToMany(
    () => RecipeIngredient,
    (recipeIngredient) => recipeIngredient.recipe,
    {
      cascade: true, // Permite crear/actualizar RecipeIngredients al guardar/actualizar una Recipe
      eager: false, // Carga los recipeIngredients solo cuando se acceden explícitamente o se especifican en las opciones de find
    },
  )
  recipeIngredients: RecipeIngredient[];

  @ManyToMany(() => Tool, (tool) => tool.recipes, {
    cascade: ['insert', 'update'],
  }) // 'recipes' será la propiedad en Tool
  @JoinTable({
    name: 'recipe_required_tools',
    joinColumn: { name: 'recipe_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tool_id', referencedColumnName: 'id' },
  })
  requiredTools: Tool[];
}
