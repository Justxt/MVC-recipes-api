import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @OneToMany(
    () => RecipeIngredient,
    (recipeIngredient) => recipeIngredient.recipe,
    {
      cascade: true, // Permite crear/actualizar RecipeIngredients al guardar/actualizar una Recipe
      eager: false, // Carga los recipeIngredients solo cuando se acceden explícitamente o se especifican en las opciones de find
    },
  )
  recipeIngredients: RecipeIngredient[];
}
