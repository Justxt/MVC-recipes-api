import { RecipeBuilder } from './recipe.builder';
import { BadRequestException } from '@nestjs/common';

// Mocks simples de los repositorios de TypeORM
const createRecipeRepositoryMock = () => ({
  create: jest.fn().mockImplementation((data) => ({ ...data })),
  save: jest.fn().mockImplementation((recipe) => ({ id: 'recipe-uuid', ...recipe })),
});

const createRecipeIngredientRepositoryMock = () => ({
  create: jest.fn().mockImplementation((data) => ({ id: 'recipe-ingredient-uuid', ...data })),
});

const createIngredientRepositoryMock = () => ({
  findOneBy: jest.fn(),
});

const createToolRepositoryMock = () => ({
  findBy: jest.fn(),
});

describe('RecipeBuilder – pruebas funcionales', () => {
  let recipeRepository: ReturnType<typeof createRecipeRepositoryMock>;
  let recipeIngredientRepository: ReturnType<typeof createRecipeIngredientRepositoryMock>;
  let ingredientRepository: ReturnType<typeof createIngredientRepositoryMock>;
  let toolRepository: ReturnType<typeof createToolRepositoryMock>;
  let builder: RecipeBuilder;

  beforeEach(() => {
    recipeRepository = createRecipeRepositoryMock();
    recipeIngredientRepository = createRecipeIngredientRepositoryMock();
    ingredientRepository = createIngredientRepositoryMock();
    toolRepository = createToolRepositoryMock();

    builder = new RecipeBuilder(
      recipeRepository as any,
      recipeIngredientRepository as any,
      ingredientRepository as any,
      toolRepository as any,
    );
  });

  it('debería construir correctamente una receta con ingredientes y herramientas', async () => {
    // Arrange
    const ingredientId = 'ingredient-uuid';
    const toolId = 'tool-uuid';

    ingredientRepository.findOneBy.mockResolvedValue({ id: ingredientId, name: 'Sal' });
    toolRepository.findBy.mockResolvedValue([{ id: toolId, name: 'Sartén' }]);

    // Act
    await builder
      .withBasicInfo({
        title: 'Tortilla',
        description: 'Una deliciosa tortilla',
        preparationTimeMinutes: 10,
        cookingTimeMinutes: 5,
        servings: 2,
      })
      .withSteps(['Batir huevos', 'Cocinar en sartén']);

    await builder.addIngredients([
      {
        ingredientId,
        quantity: '2',
        unit: 'uds',
        notes: 'Huevos frescos',
      },
    ]);

    await builder.addTools([toolId]);

    const recipe = await builder.build();

    // Assert
    expect(recipe.id).toBe('recipe-uuid');
    expect(recipe.recipeIngredients).toHaveLength(1);
    expect(recipe.requiredTools).toHaveLength(1);
    expect(recipe.title).toBe('Tortilla');
  });

  it('debería lanzar BadRequestException si un ingrediente no se encuentra', async () => {
    // Arrange
    const nonExistingIngredientId = 'non-existing-uuid';
    ingredientRepository.findOneBy.mockResolvedValue(null);

    // Act
    const promise = builder.addIngredients([
      {
        ingredientId: nonExistingIngredientId,
        quantity: '1',
        unit: 'kg',
        notes: undefined,
      },
    ]);

    // Assert
    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
  });
}); 