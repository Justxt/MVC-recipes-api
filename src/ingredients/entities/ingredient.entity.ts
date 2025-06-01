import { RecipeIngredient } from 'src/recipes/entities/recipe-ingredient.entity';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'simple-array',
    nullable: true,
    comment: 'vegetal, carne, lácteo, vegano, etc',
  })
  tags: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  //Aqui relacionamos el ingrediente con la receta
  @OneToMany(
    () => RecipeIngredient,
    (recipeIngredient) => recipeIngredient.ingredient,
  )
  recipeIngredients: RecipeIngredient[];
}
