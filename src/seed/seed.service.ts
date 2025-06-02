import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Tool } from '../tools/entities/tool.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { RecipeIngredient } from 'src/recipes/entities/recipe-ingredient.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Inicio del Seed');
    await this.seedIngredients();
    await this.seedTools();
    await this.seedRecipes();
    this.logger.log('Seed completado');
  }

  private async seedRecipes() {
    const recipeCount = await this.recipeRepository.count();
    if (recipeCount > 0) {
      this.logger.log('Recetas ya existen. Omitiendo seeding.');
      return;
    }

    this.logger.log('Seeding Recipes...');

    // Esto es crucial: los nombres deben coincidir con lo que sembraste en seedIngredients() y seedTools()
    const pollo = await this.ingredientRepository.findOne({
      where: { name: 'Pollo' },
    });
    const arroz = await this.ingredientRepository.findOne({
      where: { name: 'Arroz' },
    });
    const cebolla = await this.ingredientRepository.findOne({
      where: { name: 'Cebolla' },
    });
    const tomate = await this.ingredientRepository.findOne({
      where: { name: 'Tomate' },
    });
    const aceiteOliva = await this.ingredientRepository.findOne({
      where: { name: 'Aceite de Oliva' },
    });
    const sal = await this.ingredientRepository.findOne({
      where: { name: 'Sal' },
    });
    const pimienta = await this.ingredientRepository.findOne({
      where: { name: 'Pimienta Negra' },
    });

    const sarten = await this.toolRepository.findOne({
      where: { name: 'Sartén' },
    });
    const ollaMediana = await this.toolRepository.findOne({
      where: { name: 'Olla Mediana' },
    });
    const cuchilloChef = await this.toolRepository.findOne({
      where: { name: 'Cuchillo de Chef' },
    });
    const tablaCortar = await this.toolRepository.findOne({
      where: { name: 'Tabla de Cortar' },
    });

    // Validar que los ingredientes y herramientas base fueron encontrados
    if (
      !pollo ||
      !arroz ||
      !cebolla ||
      !tomate ||
      !aceiteOliva ||
      !sal ||
      !pimienta ||
      !sarten ||
      !ollaMediana ||
      !cuchilloChef ||
      !tablaCortar
    ) {
      this.logger.error(
        'One or more base ingredients/tools not found. Skipping recipe seeding. Make sure ingredients and tools are seeded first.',
      );
      return;
    }

    const recipesToSeed = [
      {
        title: 'Arroz con Pollo Sencillo',
        description: 'Una receta clásica y fácil de arroz con pollo.',
        preparationTimeMinutes: 15,
        cookingTimeMinutes: 30,
        servings: 4,
        steps: [
          'Cortar el pollo en cubos medianos',
          'Picar la cebolla finamente',
          'Picar el tomate y remover las semillas',
          'Calentar el aceite de oliva en la sartén a fuego medio',
          'Agregar la cebolla y cocinar hasta que esté transparente',
          'Añadir el pollo y dorar por todos los lados',
          'Agregar el tomate picado y cocinar por 2 minutos',
          'Incorporar el arroz y mezclar bien',
          'Agregar 2 tazas de agua o caldo',
          'Sazonar con sal y pimienta al gusto',
          'Llevar a ebullición, luego reducir el fuego',
          'Cocinar tapado por 18-20 minutos hasta que el arroz esté tierno',
          'Dejar reposar 5 minutos antes de servir'
        ],
        recipeIngredientsData: [
          {
            ingredient: pollo,
            quantity: '2',
            unit: 'pechugas',
            notes: 'cortadas en cubos',
          },
          { ingredient: arroz, quantity: '1', unit: 'taza', notes: 'crudo' },
          {
            ingredient: cebolla,
            quantity: '1/2',
            unit: 'unidad',
            notes: 'picada',
          },
          {
            ingredient: tomate,
            quantity: '1',
            unit: 'unidad',
            notes: 'picado, sin semillas',
          },
          { ingredient: aceiteOliva, quantity: '2', unit: 'cucharadas' },
          { ingredient: sal, quantity: 'a gusto', unit: '' },
          { ingredient: pimienta, quantity: 'a gusto', unit: '' },
        ],
        requiredToolsData: [sarten, ollaMediana, cuchilloChef, tablaCortar],
      },

      {
        title: 'Ensalada Básica de Tomate y Cebolla',
        description: 'Una ensalada refrescante y simple.',
        preparationTimeMinutes: 10,
        cookingTimeMinutes: 0,
        servings: 2,
        steps: [
          'Lavar los tomates y cortarlos en rodajas de 1 cm de grosor',
          'Pelar la cebolla y cortarla en juliana fina',
          'Colocar las rodajas de tomate en un plato de servir',
          'Distribuir la cebolla sobre los tomates',
          'Rociar con aceite de oliva',
          'Sazonar con sal y pimienta al gusto',
          'Dejar reposar 5 minutos para que se mezclen los sabores',
          'Servir inmediatamente'
        ],
        recipeIngredientsData: [
          {
            ingredient: tomate,
            quantity: '2',
            unit: 'unidades',
            notes: 'en rodajas',
          },
          {
            ingredient: cebolla,
            quantity: '1/4',
            unit: 'unidad',
            notes: 'en juliana fina',
          },
          { ingredient: aceiteOliva, quantity: '1', unit: 'cucharada' },
          { ingredient: sal, quantity: 'una pizca', unit: '' },
          { ingredient: pimienta, quantity: 'una pizca', unit: '' },
        ],
        requiredToolsData: [cuchilloChef, tablaCortar],
      },
    ];

    for (const recipeData of recipesToSeed) {
      const { recipeIngredientsData, requiredToolsData, ...recipeDetails } =
        recipeData;

      const newRecipe = this.recipeRepository.create(recipeDetails);
      newRecipe.recipeIngredients = [];
      newRecipe.requiredTools = [];

      // Procesar RecipeIngredients
      if (recipeIngredientsData) {
        for (const riData of recipeIngredientsData) {
          if (!riData.ingredient) {
            this.logger.warn(
              `Ingrediente no encontrado para la receta "${newRecipe.title}", datos: ${JSON.stringify(riData)}. Saltando este ingrediente.`,
            );
            continue;
          }
          const recipeIngredient = new RecipeIngredient();
          recipeIngredient.ingredient = riData.ingredient;
          recipeIngredient.quantity = riData.quantity;
          recipeIngredient.unit = riData.unit;
          recipeIngredient.notes = riData.notes;
          recipeIngredient.recipe = newRecipe; // Establecer la relación bidireccional
          newRecipe.recipeIngredients.push(recipeIngredient);
        }
      }

      // Procesar RequiredTools
      if (requiredToolsData) {
        newRecipe.requiredTools = requiredToolsData.filter((tool) => {
          // Filtrar por si alguna herramienta no se encontró
          if (!tool)
            this.logger.warn(
              `Herramienta no encontrada para la receta "${newRecipe.title}".`,
            );
          return !!tool;
        });
      }

      try {
        await this.recipeRepository.save(newRecipe);
        this.logger.log(`Recipe "${newRecipe.title}" seeded successfully.`);
      } catch (error) {
        this.logger.error(`Error seeding recipe "${newRecipe.title}":`, error);
      }
    }
  }

  private async seedIngredients() {
    const count = await this.ingredientRepository.count();
    if (count > 0) {
      this.logger.log('Ingredients table already has data. Skipping seeding.');
      return;
    }

    this.logger.log('Seeding Ingredients...');
    const ingredientsToSeed: Partial<Ingredient>[] = [
      {
        name: 'Pollo',
        tags: ['carne', 'ave'],
        description: 'Pechuga de pollo fresca',
      },
      {
        name: 'Arroz',
        tags: ['cereal', 'grano', 'guarnicion'],
        description: 'Arroz blanco de grano largo',
      },
      {
        name: 'Cebolla',
        tags: ['vegetal', 'bulbo'],
        description: 'Cebolla blanca o amarilla',
      },
      {
        name: 'Tomate',
        tags: ['fruta', 'vegetal', 'rojo'],
        description: 'Tomate maduro para ensalada o salsa',
      },
      {
        name: 'Huevo',
        tags: ['proteina', 'desayuno'],
        description: 'Huevos de gallina frescos',
      },
      {
        name: 'Aceite de Oliva',
        tags: ['aceite', 'grasa_saludable', 'mediterraneo'],
        description: 'Aceite de oliva extra virgen',
      },
      { name: 'Sal', tags: ['condimento', 'mineral'] },
      { name: 'Pimienta Negra', tags: ['condimento', 'especia'] },
      {
        name: 'Ajo',
        tags: ['vegetal', 'condimento', 'bulbo'],
        description: 'Dientes de ajo frescos',
      },
      {
        name: 'Lechuga',
        tags: ['vegetal', 'hoja_verde', 'ensalada'],
        description: 'Lechuga fresca (romana, iceberg, etc.)',
      },
      {
        name: 'Queso Parmesano',
        tags: ['lacteo', 'queso', 'duro', 'rallar'],
        description: 'Queso parmesano auténtico',
      },
      {
        name: 'Limón',
        tags: ['fruta', 'citrico', 'acido'],
        description: 'Limones frescos y jugosos',
      },
      {
        name: 'Pasta',
        tags: ['carbohidrato', 'trigo', 'italiano'],
        description: 'Pasta seca (spaghetti, penne, etc.)',
      },
      {
        name: 'Carne Molida de Res',
        tags: ['carne', 'res', 'molida'],
        description: 'Carne molida magra de res',
      },
      {
        name: 'Zanahoria',
        tags: ['vegetal', 'raiz', 'naranja'],
        description: 'Zanahorias frescas',
      },
    ];

    try {
      await this.ingredientRepository.save(
        ingredientsToSeed.map((data) => this.ingredientRepository.create(data)),
      );
      this.logger.log(
        `${ingredientsToSeed.length} ingredients seeded successfully.`,
      );
    } catch (error) {
      this.logger.error('Error seeding ingredients:', error);
    }
  }

  private async seedTools() {
    const count = await this.toolRepository.count();
    if (count > 0) {
      this.logger.log('Tools table already has data. Skipping seeding.');
      return;
    }

    this.logger.log('Seeding Tools...');
    const toolsToSeed: Partial<Tool>[] = [
      { name: 'Sartén' },
      { name: 'Olla Grande' },
      { name: 'Olla Mediana' },
      { name: 'Cuchillo de Chef' },
      { name: 'Tabla de Cortar' },
      { name: 'Horno' },
      { name: 'Microondas' },
      { name: 'Licuadora' },
      { name: 'Batidora de Mano' },
      { name: 'Colador' },
      { name: 'Rallador' },
      { name: 'Tazas Medidoras' },
      { name: 'Cucharas Medidoras' },
      { name: 'Espátula' },
      { name: 'Cucharón' },
    ];

    try {
      await this.toolRepository.save(
        toolsToSeed.map((data) => this.toolRepository.create(data)),
      );
      this.logger.log(`${toolsToSeed.length} tools seeded successfully.`);
    } catch (error) {
      this.logger.error('Error seeding tools:', error);
    }
  }
}
