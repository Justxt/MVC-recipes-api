import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  quantity: string; //string para manejar 1/2

  @Column({ type: 'varchar', length: 100, nullable: false })
  unit: string; // como tazas, cucharadas

  @Column({ type: 'text', nullable: true })
  notes?: string; // notas como picado finamente

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}
