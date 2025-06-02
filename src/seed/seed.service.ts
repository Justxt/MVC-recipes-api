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
    this.logger.log('🚀 Iniciando seed profesional de recetas...');
    await this.seedIngredients();
    await this.seedTools();
    await this.seedRecipes();
    this.logger.log('✅ Seed completado con éxito');
  }

  private async seedIngredients() {
    const count = await this.ingredientRepository.count();
    if (count > 0) {
      this.logger.log('Ingredients table already has data. Skipping seeding.');
      return;
    }

    this.logger.log('Seeding Ingredients...');
    const ingredientsToSeed: Partial<Ingredient>[] = [
      // CARNES Y PROTEÍNAS
      {
        name: 'Pollo',
        tags: ['carne', 'ave', 'proteina'],
        description: 'Pechuga de pollo fresca sin piel',
      },
      {
        name: 'Carne Molida de Res',
        tags: ['carne', 'res', 'molida', 'proteina'],
        description: 'Carne molida magra de res 90/10',
      },
      {
        name: 'Salmón',
        tags: ['pescado', 'omega3', 'proteina', 'saludable'],
        description: 'Filete de salmón fresco del Atlántico',
      },
      {
        name: 'Atún',
        tags: ['pescado', 'enlatado', 'proteina'],
        description: 'Atún en agua, bajo en sodio',
      },
      {
        name: 'Camarones',
        tags: ['mariscos', 'proteina', 'bajo_en_calorias'],
        description: 'Camarones grandes pelados y desvenados',
      },
      {
        name: 'Huevo',
        tags: ['proteina', 'desayuno', 'versatil'],
        description: 'Huevos orgánicos de gallinas libres',
      },
      {
        name: 'Tocino',
        tags: ['carne', 'cerdo', 'desayuno'],
        description: 'Tocino ahumado en lonchas',
      },
      {
        name: 'Jamón',
        tags: ['carne', 'cerdo', 'embutido'],
        description: 'Jamón cocido bajo en sodio',
      },

      // LÁCTEOS
      {
        name: 'Queso Mozzarella',
        tags: ['lacteo', 'queso', 'italiano', 'pizza'],
        description: 'Queso mozzarella fresco o rallado',
      },
      {
        name: 'Queso Parmesano',
        tags: ['lacteo', 'queso', 'duro', 'italiano'],
        description: 'Queso parmesano auténtico para rallar',
      },
      {
        name: 'Queso Cheddar',
        tags: ['lacteo', 'queso', 'amarillo'],
        description: 'Queso cheddar curado',
      },
      {
        name: 'Leche',
        tags: ['lacteo', 'liquido', 'calcio'],
        description: 'Leche entera fresca',
      },
      {
        name: 'Crema de Leche',
        tags: ['lacteo', 'grasa', 'cocina'],
        description: 'Crema de leche para cocinar',
      },
      {
        name: 'Mantequilla',
        tags: ['lacteo', 'grasa', 'cocina'],
        description: 'Mantequilla sin sal',
      },
      {
        name: 'Yogur Griego',
        tags: ['lacteo', 'probioticos', 'saludable'],
        description: 'Yogur griego natural sin azúcar',
      },

      // VEGETALES
      {
        name: 'Tomate',
        tags: ['fruta', 'vegetal', 'rojo', 'versatil'],
        description: 'Tomates maduros de primera calidad',
      },
      {
        name: 'Cebolla',
        tags: ['vegetal', 'bulbo', 'base'],
        description: 'Cebolla amarilla dulce',
      },
      {
        name: 'Ajo',
        tags: ['vegetal', 'condimento', 'bulbo'],
        description: 'Cabezas de ajo fresco',
      },
      {
        name: 'Pimiento Rojo',
        tags: ['vegetal', 'dulce', 'colorido'],
        description: 'Pimientos rojos dulces',
      },
      {
        name: 'Pimiento Verde',
        tags: ['vegetal', 'dulce', 'colorido'],
        description: 'Pimientos verdes frescos',
      },
      {
        name: 'Zanahoria',
        tags: ['vegetal', 'raiz', 'dulce', 'vitamina_a'],
        description: 'Zanahorias baby o grandes',
      },
      {
        name: 'Apio',
        tags: ['vegetal', 'crujiente', 'bajo_calorias'],
        description: 'Tallos de apio fresco',
      },
      {
        name: 'Brócoli',
        tags: ['vegetal', 'verde', 'nutritivo'],
        description: 'Brócoli fresco en floretes',
      },
      {
        name: 'Espinaca',
        tags: ['vegetal', 'hoja_verde', 'hierro'],
        description: 'Espinaca baby fresca',
      },
      {
        name: 'Lechuga',
        tags: ['vegetal', 'hoja_verde', 'ensalada'],
        description: 'Lechuga romana o iceberg',
      },
      {
        name: 'Pepino',
        tags: ['vegetal', 'refrescante', 'hidratante'],
        description: 'Pepino fresco para ensaladas',
      },
      {
        name: 'Aguacate',
        tags: ['fruta', 'grasa_saludable', 'cremoso'],
        description: 'Aguacates maduros tipo Hass',
      },
      {
        name: 'Champiñones',
        tags: ['hongo', 'umami', 'versatil'],
        description: 'Champiñones blancos frescos',
      },

      // CARBOHIDRATOS
      {
        name: 'Arroz',
        tags: ['cereal', 'grano', 'guarnicion'],
        description: 'Arroz blanco de grano largo',
      },
      {
        name: 'Pasta',
        tags: ['carbohidrato', 'trigo', 'italiano'],
        description: 'Pasta de sémola de trigo',
      },
      {
        name: 'Pan',
        tags: ['carbohidrato', 'trigo', 'basico'],
        description: 'Pan integral o blanco fresco',
      },
      {
        name: 'Papa',
        tags: ['tuberculo', 'versatil', 'guarnicion'],
        description: 'Papas para hornear o cocinar',
      },
      {
        name: 'Quinoa',
        tags: ['pseudocereal', 'proteina', 'sin_gluten'],
        description: 'Quinoa blanca o tricolor',
      },

      // CONDIMENTOS Y ESPECIAS
      {
        name: 'Sal',
        tags: ['condimento', 'mineral', 'basico'],
        description: 'Sal marina o sal de mesa',
      },
      {
        name: 'Pimienta Negra',
        tags: ['condimento', 'especia', 'picante'],
        description: 'Pimienta negra recién molida',
      },
      {
        name: 'Aceite de Oliva',
        tags: ['aceite', 'grasa_saludable', 'mediterraneo'],
        description: 'Aceite de oliva extra virgen prensado en frío',
      },
      {
        name: 'Vinagre Balsámico',
        tags: ['vinagre', 'acido', 'italiano'],
        description: 'Vinagre balsámico de Módena',
      },
      {
        name: 'Mostaza Dijon',
        tags: ['condimento', 'cremoso', 'frances'],
        description: 'Mostaza Dijon francesa',
      },
      {
        name: 'Salsa de Soya',
        tags: ['condimento', 'asiatico', 'umami'],
        description: 'Salsa de soya baja en sodio',
      },
      {
        name: 'Miel',
        tags: ['endulzante', 'natural', 'dorado'],
        description: 'Miel pura de abeja',
      },
      {
        name: 'Paprika',
        tags: ['especia', 'dulce', 'colorante'],
        description: 'Paprika dulce española',
      },
      {
        name: 'Orégano',
        tags: ['hierba', 'mediterraneo', 'aromatico'],
        description: 'Orégano seco o fresco',
      },
      {
        name: 'Albahaca',
        tags: ['hierba', 'italiano', 'fresco'],
        description: 'Albahaca fresca o seca',
      },
      {
        name: 'Comino',
        tags: ['especia', 'terroso', 'latino'],
        description: 'Comino molido',
      },
      {
        name: 'Cilantro',
        tags: ['hierba', 'fresco', 'latino'],
        description: 'Cilantro fresco',
      },

      // FRUTAS
      {
        name: 'Limón',
        tags: ['fruta', 'citrico', 'acido'],
        description: 'Limones amarillos jugosos',
      },
      {
        name: 'Lima',
        tags: ['fruta', 'citrico', 'verde'],
        description: 'Limas verdes frescas',
      },
      {
        name: 'Manzana',
        tags: ['fruta', 'dulce', 'crujiente'],
        description: 'Manzanas rojas o verdes',
      },
      {
        name: 'Plátano',
        tags: ['fruta', 'dulce', 'potasio'],
        description: 'Plátanos maduros',
      },
      {
        name: 'Fresas',
        tags: ['fruta', 'dulce', 'rojo'],
        description: 'Fresas frescas de temporada',
      },

      // OTROS
      {
        name: 'Frijoles Negros',
        tags: ['legumbre', 'proteina', 'fibra'],
        description: 'Frijoles negros cocidos o secos',
      },
      {
        name: 'Garbanzos',
        tags: ['legumbre', 'proteina', 'versatil'],
        description: 'Garbanzos cocidos o secos',
      },
      {
        name: 'Nueces',
        tags: ['fruto_seco', 'grasa_saludable', 'crujiente'],
        description: 'Nueces de Castilla',
      },
      {
        name: 'Almendras',
        tags: ['fruto_seco', 'proteina', 'vitamina_e'],
        description: 'Almendras crudas o tostadas',
      },
      {
        name: 'Chocolate Negro',
        tags: ['dulce', 'cacao', 'antioxidante'],
        description: 'Chocolate negro 70% cacao',
      },
      {
        name: 'Harina',
        tags: ['carbohidrato', 'trigo', 'horneado'],
        description: 'Harina de trigo todo uso',
      },
      {
        name: 'Azúcar',
        tags: ['endulzante', 'dulce', 'basico'],
        description: 'Azúcar blanca refinada',
      },
      {
        name: 'Caldo de Pollo',
        tags: ['liquido', 'base', 'sabor'],
        description: 'Caldo de pollo bajo en sodio',
      },
    ];

    try {
      await this.ingredientRepository.save(
        ingredientsToSeed.map((data) => this.ingredientRepository.create(data)),
      );
      this.logger.log(
        `✅ ${ingredientsToSeed.length} ingredientes profesionales creados exitosamente.`,
      );
    } catch (error) {
      this.logger.error('❌ Error seeding ingredients:', error);
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
      // UTENSILIOS DE COCINA BÁSICOS
      { name: 'Sartén' },
      { name: 'Sartén Antiadherente' },
      { name: 'Olla Grande' },
      { name: 'Olla Mediana' },
      { name: 'Olla a Presión' },
      { name: 'Cacerola' },
      { name: 'Wok' },
      
      // CUCHILLOS Y CORTE
      { name: 'Cuchillo de Chef' },
      { name: 'Cuchillo de Pan' },
      { name: 'Cuchillo Paring' },
      { name: 'Tabla de Cortar' },
      { name: 'Tabla de Cortar para Carnes' },
      
      // ELECTRODOMÉSTICOS
      { name: 'Horno' },
      { name: 'Microondas' },
      { name: 'Licuadora' },
      { name: 'Procesador de Alimentos' },
      { name: 'Batidora de Mano' },
      { name: 'Batidora de Pie' },
      { name: 'Parrilla' },
      { name: 'Tostadora' },
      
      // UTENSILIOS DE MEDICIÓN
      { name: 'Tazas Medidoras' },
      { name: 'Cucharas Medidoras' },
      { name: 'Balanza de Cocina' },
      { name: 'Termómetro de Carne' },
      
      // UTENSILIOS DE MANIPULACIÓN
      { name: 'Espátula' },
      { name: 'Espátula de Silicón' },
      { name: 'Cucharón' },
      { name: 'Pinzas de Cocina' },
      { name: 'Batidor Manual' },
      { name: 'Cuchara de Madera' },
      { name: 'Espumadera' },
      
      // UTENSILIOS DE PREPARACIÓN
      { name: 'Colador' },
      { name: 'Colador Fino' },
      { name: 'Rallador' },
      { name: 'Pelador de Vegetales' },
      { name: 'Prensa de Ajos' },
      { name: 'Mortero' },
      { name: 'Mandolina' },
      
      // UTENSILIOS DE HORNEADO
      { name: 'Molde para Pasteles' },
      { name: 'Molde para Muffins' },
      { name: 'Bandeja para Hornear' },
      { name: 'Papel Pergamino' },
      { name: 'Rodillo' },
      { name: 'Molde para Pan' },
      
      // CONTENEDORES Y RECIPIENTES
      { name: 'Tazones de Mezcla' },
      { name: 'Recipientes Herméticos' },
      { name: 'Fuentes para Hornear' },
      { name: 'Moldes Individuales' },
      
      // OTROS UTENSILIOS ÚTILES
      { name: 'Abrelatas' },
      { name: 'Sacacorchos' },
      { name: 'Timer de Cocina' },
      { name: 'Guantes de Horno' },
      { name: 'Rejilla de Enfriamiento' },
      { name: 'Brocha de Cocina' },
    ];

    try {
      await this.toolRepository.save(
        toolsToSeed.map((data) => this.toolRepository.create(data)),
      );
      this.logger.log(`✅ ${toolsToSeed.length} herramientas profesionales creadas exitosamente.`);
    } catch (error) {
      this.logger.error('❌ Error seeding tools:', error);
    }
  }

  private async seedRecipes() {
    const recipeCount = await this.recipeRepository.count();
    if (recipeCount > 0) {
      this.logger.log('Recetas ya existen. Omitiendo seeding.');
      return;
    }

    this.logger.log('Seeding Recipes...');

    // Funciones helper para obtener ingredientes y herramientas
    const getIngredient = async (name: string) => {
      const ingredient = await this.ingredientRepository.findOne({ where: { name } });
      if (!ingredient) {
        this.logger.warn(`Ingrediente "${name}" no encontrado`);
      }
      return ingredient;
    };

    const getTool = async (name: string) => {
      const tool = await this.toolRepository.findOne({ where: { name } });
      if (!tool) {
        this.logger.warn(`Herramienta "${name}" no encontrada`);
      }
      return tool;
    };

    // Obtener ingredientes esenciales
    const [pollo, arroz, cebolla, tomate, aceiteOliva, sal, pimienta, ajo, huevo, 
           pasta, carneMolida, quesoMozzarella, quesoParmesano, salmón, camarones,
           lechuga, aguacate, limón, papa, brócoli, zanahoria, apio, pimientoRojo,
           mantequilla, cremaLeche, leche, tocino, jamón, espinaca, champiñones,
           paprika, orégano, albahaca, mostazaDijon, vinaigreBalsámico, miel,
           frijoles, yogurGriego, nueces, almendras, fresas, plátano, chocolateNegro,
           harina, azúcar, caldoPollo, quinoa, pepino, comino, cilantro] = await Promise.all([
      getIngredient('Pollo'), getIngredient('Arroz'), getIngredient('Cebolla'),
      getIngredient('Tomate'), getIngredient('Aceite de Oliva'), getIngredient('Sal'),
      getIngredient('Pimienta Negra'), getIngredient('Ajo'), getIngredient('Huevo'),
      getIngredient('Pasta'), getIngredient('Carne Molida de Res'), getIngredient('Queso Mozzarella'),
      getIngredient('Queso Parmesano'), getIngredient('Salmón'), getIngredient('Camarones'),
      getIngredient('Lechuga'), getIngredient('Aguacate'), getIngredient('Limón'),
      getIngredient('Papa'), getIngredient('Brócoli'), getIngredient('Zanahoria'),
      getIngredient('Apio'), getIngredient('Pimiento Rojo'), getIngredient('Mantequilla'),
      getIngredient('Crema de Leche'), getIngredient('Leche'), getIngredient('Tocino'),
      getIngredient('Jamón'), getIngredient('Espinaca'), getIngredient('Champiñones'),
      getIngredient('Paprika'), getIngredient('Orégano'), getIngredient('Albahaca'),
      getIngredient('Mostaza Dijon'), getIngredient('Vinagre Balsámico'), getIngredient('Miel'),
      getIngredient('Frijoles Negros'), getIngredient('Yogur Griego'), getIngredient('Nueces'),
      getIngredient('Almendras'), getIngredient('Fresas'), getIngredient('Plátano'),
      getIngredient('Chocolate Negro'), getIngredient('Harina'), getIngredient('Azúcar'),
      getIngredient('Caldo de Pollo'), getIngredient('Quinoa'), getIngredient('Pepino'),
      getIngredient('Comino'), getIngredient('Cilantro')
    ]);

    // Obtener herramientas esenciales
    const [sarten, sartenAntiadherente, olla, ollaGrande, cuchilloChef, tablaCortar, 
           horno, microondas, licuadora, batidora, tazasMedidoras, colador, rallador,
           espatula, cucharon, pinzas, wok, parrilla, procesador, moldeHornear,
           tazonesMezcla, termómetro, papelPergamino] = await Promise.all([
      getTool('Sartén'), getTool('Sartén Antiadherente'), getTool('Olla Mediana'), 
      getTool('Olla Grande'), getTool('Cuchillo de Chef'), getTool('Tabla de Cortar'),
      getTool('Horno'), getTool('Microondas'), getTool('Licuadora'), getTool('Batidora de Mano'),
      getTool('Tazas Medidoras'), getTool('Colador'), getTool('Rallador'), getTool('Espátula'),
      getTool('Cucharón'), getTool('Pinzas de Cocina'), getTool('Wok'), getTool('Parrilla'),
      getTool('Procesador de Alimentos'), getTool('Molde para Pasteles'), getTool('Tazones de Mezcla'),
      getTool('Termómetro de Carne'), getTool('Papel Pergamino')
    ]);

    const recipesToSeed = [
      // DESAYUNOS
      {
        title: 'Huevos Revueltos Cremosos con Tocino',
        description: 'Desayuno clásico americano con huevos perfectamente cremosos y tocino crujiente. Un start perfecto para el día.',
        preparationTimeMinutes: 5,
        cookingTimeMinutes: 10,
        servings: 2,
        steps: [
          'Cocinar las tiras de tocino en una sartén a fuego medio hasta que estén doradas y crujientes (5-7 min)',
          'Retirar el tocino y reservar en papel absorbente',
          'Batir los huevos en un tazón con un poco de sal y pimienta',
          'Agregar una cucharada de mantequilla a la sartén a fuego bajo',
          'Verter los huevos batidos cuando la mantequilla se derrita',
          'Revolver constantemente con espátula de silicón por 3-4 minutos',
          'Cuando los huevos estén casi listos, retirar del fuego (seguirán cocinándose)',
          'Servir inmediatamente con el tocino crujiente al lado'
        ],
        recipeIngredientsData: [
          { ingredient: huevo, quantity: '4', unit: 'unidades', notes: 'frescos' },
          { ingredient: tocino, quantity: '4', unit: 'tiras', notes: 'gruesas' },
          { ingredient: mantequilla, quantity: '1', unit: 'cucharada', notes: 'sin sal' },
          { ingredient: sal, quantity: 'al gusto', unit: '' },
          { ingredient: pimienta, quantity: 'al gusto', unit: '' }
        ].filter(item => item.ingredient),
        requiredToolsData: [sarten, espatula, tazonesMezcla].filter(Boolean)
      },

      {
        title: 'Smoothie Bowl de Fresas y Plátano',
        description: 'Bowl de smoothie instagram-worthy, cargado de antioxidantes y perfecto para un desayuno saludable y energético.',
        preparationTimeMinutes: 10,
        cookingTimeMinutes: 0,
        servings: 1,
        steps: [
          'Congelar las fresas y el plátano cortado en rodajas la noche anterior',
          'En la licuadora, combinar fresas congeladas, plátano y yogur griego',
          'Agregar una cucharada de miel para endulzar',
          'Licuar hasta obtener una consistencia espesa y cremosa',
          'Verter en un bowl amplio',
          'Decorar con rodajas de plátano fresco, fresas cortadas y almendras',
          'Agregar un toque final con más miel si se desea',
          'Servir inmediatamente con cuchara'
        ],
        recipeIngredientsData: [
          { ingredient: fresas, quantity: '1', unit: 'taza', notes: 'congeladas' },
          { ingredient: plátano, quantity: '1', unit: 'unidad', notes: 'congelado' },
          { ingredient: yogurGriego, quantity: '1/2', unit: 'taza', notes: 'natural' },
          { ingredient: miel, quantity: '1', unit: 'cucharada', notes: 'pura' },
          { ingredient: almendras, quantity: '2', unit: 'cucharadas', notes: 'laminadas' }
        ].filter(item => item.ingredient),
        requiredToolsData: [licuadora, tazonesMezcla].filter(Boolean)
      },

      // ALMUERZO/CENA PRINCIPALES
      {
        title: 'Salmón a la Parrilla con Vegetales',
        description: 'Filete de salmón jugoso con una mezcla colorida de vegetales asados. Plato saludable y elegante perfecto para una cena especial.',
        preparationTimeMinutes: 15,
        cookingTimeMinutes: 25,
        servings: 4,
        steps: [
          'Precalentar el horno a 200°C',
          'Cortar brócoli, zanahoria y pimiento rojo en trozos uniformes',
          'Mezclar los vegetales con aceite de oliva, sal, pimienta y paprika',
          'Extender los vegetales en una bandeja y hornear por 15 minutos',
          'Mientras tanto, sazonar los filetes de salmón con sal, pimienta y un toque de limón',
          'Calentar la parrilla o sartén a fuego medio-alto',
          'Cocinar el salmón 4-5 minutos por cada lado hasta que esté dorado',
          'Verificar que el centro esté rosado y se desmenuce fácilmente',
          'Servir el salmón sobre los vegetales asados con una rodaja de limón'
        ],
        recipeIngredientsData: [
          { ingredient: salmón, quantity: '4', unit: 'filetes', notes: '150g cada uno' },
          { ingredient: brócoli, quantity: '2', unit: 'tazas', notes: 'en floretes' },
          { ingredient: zanahoria, quantity: '2', unit: 'unidades', notes: 'en bastones' },
          { ingredient: pimientoRojo, quantity: '1', unit: 'unidad', notes: 'en tiras' },
          { ingredient: aceiteOliva, quantity: '3', unit: 'cucharadas' },
          { ingredient: limón, quantity: '1', unit: 'unidad', notes: 'en rodajas' },
          { ingredient: paprika, quantity: '1', unit: 'cucharadita' },
          { ingredient: sal, quantity: 'al gusto', unit: '' },
          { ingredient: pimienta, quantity: 'al gusto', unit: '' }
        ].filter(item => item.ingredient),
        requiredToolsData: [parrilla, horno, moldeHornear, cuchilloChef, tablaCortar].filter(Boolean)
      },

      {
        title: 'Pasta Carbonara Auténtica',
        description: 'La verdadera carbonara romana con solo 5 ingredientes. Cremosa, indulgente y absolutamente irresistible.',
        preparationTimeMinutes: 10,
        cookingTimeMinutes: 15,
        servings: 4,
        steps: [
          'Poner a hervir agua con sal abundante para la pasta',
          'Cortar el tocino en cubitos pequeños',
          'En una sartén grande, cocinar el tocino a fuego medio hasta que esté dorado',
          'En un tazón, batir huevos enteros con queso parmesano rallado y pimienta negra',
          'Cocinar la pasta al dente según las instrucciones del paquete',
          'Reservar 1 taza del agua de cocción antes de escurrir',
          'Agregar la pasta caliente al tocino en la sartén (fuego apagado)',
          'Verter la mezcla de huevos mientras se revuelve constantemente',
          'Agregar agua de pasta si es necesario para crear una salsa cremosa',
          'Servir inmediatamente con más queso parmesano y pimienta'
        ],
        recipeIngredientsData: [
          { ingredient: pasta, quantity: '400', unit: 'gramos', notes: 'spaghetti o fettuccine' },
          { ingredient: tocino, quantity: '150', unit: 'gramos', notes: 'en cubitos' },
          { ingredient: huevo, quantity: '3', unit: 'unidades', notes: 'enteros + 1 yema' },
          { ingredient: quesoParmesano, quantity: '100', unit: 'gramos', notes: 'rallado fino' },
          { ingredient: pimienta, quantity: '1', unit: 'cucharadita', notes: 'negra recién molida' },
          { ingredient: sal, quantity: 'para el agua', unit: '' }
        ].filter(item => item.ingredient),
        requiredToolsData: [ollaGrande, sarten, tazonesMezcla, colador, rallador].filter(Boolean)
      },

      {
        title: 'Tacos de Camarones con Salsa de Aguacate',
        description: 'Tacos frescos y vibrantes con camarones especiados y una cremosa salsa de aguacate. Perfectos para una cena ligera y deliciosa.',
        preparationTimeMinutes: 20,
        cookingTimeMinutes: 10,
        servings: 4,
        steps: [
          'Preparar la salsa: mezclar aguacate machacado, limón, cilantro, sal y pimienta',
          'Sazonar los camarones con comino, paprika, sal y pimienta',
          'Calentar aceite en una sartén a fuego medio-alto',
          'Cocinar los camarones 2-3 minutos por lado hasta que estén rosados',
          'Calentar las tortillas en una sartén seca o microondas',
          'Cortar el repollo en juliana fina para el crunch',
          'Armar los tacos: tortilla, salsa de aguacate, camarones, repollo',
          'Decorar con cilantro fresco y una rodaja de limón',
          'Servir inmediatamente mientras los camarones están calientes'
        ],
        recipeIngredientsData: [
          { ingredient: camarones, quantity: '500', unit: 'gramos', notes: 'pelados y limpios' },
          { ingredient: aguacate, quantity: '2', unit: 'unidades', notes: 'maduros' },
          { ingredient: limón, quantity: '2', unit: 'unidades', notes: 'exprimidos' },
          { ingredient: cilantro, quantity: '1/4', unit: 'taza', notes: 'fresco picado' },
          { ingredient: comino, quantity: '1', unit: 'cucharadita' },
          { ingredient: paprika, quantity: '1', unit: 'cucharadita' },
          { ingredient: aceiteOliva, quantity: '2', unit: 'cucharadas' },
          { ingredient: sal, quantity: 'al gusto', unit: '' },
          { ingredient: pimienta, quantity: 'al gusto', unit: '' }
        ].filter(item => item.ingredient),
        requiredToolsData: [sarten, tazonesMezcla, cuchilloChef, tablaCortar].filter(Boolean)
      },

      // ENSALADAS Y PLATOS LIGEROS
      {
        title: 'Ensalada César con Pollo a la Parrilla',
        description: 'La ensalada César clásica elevada con jugoso pollo a la parrilla. Fresca, sabrosa y satisfactoria.',
        preparationTimeMinutes: 20,
        cookingTimeMinutes: 15,
        servings: 4,
        steps: [
          'Sazonar las pechugas de pollo con sal, pimienta y aceite de oliva',
          'Cocinar el pollo en la parrilla 6-7 minutos por lado hasta 74°C interno',
          'Dejar reposar el pollo 5 minutos, luego cortar en tiras',
          'Lavar y secar la lechuga romana, cortarla en trozos grandes',
          'Preparar el aderezo: mezclar mostaza, limón, aceite de oliva y ajo',
          'En un bowl grande, mezclar la lechuga con el aderezo',
          'Agregar queso parmesano rallado generosamente',
          'Colocar las tiras de pollo encima',
          'Servir inmediatamente con más queso si se desea'
        ],
        recipeIngredientsData: [
          { ingredient: pollo, quantity: '2', unit: 'pechugas', notes: 'sin hueso ni piel' },
          { ingredient: lechuga, quantity: '2', unit: 'cabezas', notes: 'romana, lavada' },
          { ingredient: quesoParmesano, quantity: '1/2', unit: 'taza', notes: 'rallado' },
          { ingredient: mostazaDijon, quantity: '1', unit: 'cucharadita' },
          { ingredient: limón, quantity: '1', unit: 'unidad', notes: 'exprimido' },
          { ingredient: aceiteOliva, quantity: '3', unit: 'cucharadas' },
          { ingredient: ajo, quantity: '2', unit: 'dientes', notes: 'machacados' },
          { ingredient: sal, quantity: 'al gusto', unit: '' },
          { ingredient: pimienta, quantity: 'al gusto', unit: '' }
        ].filter(item => item.ingredient),
        requiredToolsData: [parrilla, tazonesMezcla, cuchilloChef, tablaCortar, termómetro].filter(Boolean)
      },

      {
        title: 'Bowl de Quinoa Mediterráneo',
        description: 'Bowl nutritivo y colorido inspirado en la dieta mediterránea. Lleno de sabores frescos y ingredientes saludables.',
        preparationTimeMinutes: 15,
        cookingTimeMinutes: 20,
        servings: 4,
        steps: [
          'Enjuagar la quinoa bajo agua fría hasta que el agua salga clara',
          'Cocinar la quinoa en caldo de pollo siguiendo las instrucciones del paquete',
          'Mientras se cocina la quinoa, picar tomate, pepino y cebolla finamente',
          'Preparar el aderezo mezclando aceite de oliva, vinagre balsámico, orégano y ajo',
          'Una vez cocida, dejar enfriar la quinoa ligeramente',
          'Mezclar la quinoa con los vegetales picados',
          'Agregar el aderezo y mezclar bien',
          'Incorporar el queso y las nueces justo antes de servir',
          'Decorar con hojas de albahaca fresca',
          'Servir a temperatura ambiente o ligeramente frío'
        ],
        recipeIngredientsData: [
          { ingredient: quinoa, quantity: '1', unit: 'taza', notes: 'enjuagada' },
          { ingredient: caldoPollo, quantity: '2', unit: 'tazas', notes: 'bajo en sodio' },
          { ingredient: tomate, quantity: '2', unit: 'unidades', notes: 'en cubitos' },
          { ingredient: pepino, quantity: '1', unit: 'unidad', notes: 'pelado y picado' },
          { ingredient: cebolla, quantity: '1/4', unit: 'unidad', notes: 'roja, finamente picada' },
          { ingredient: aceiteOliva, quantity: '3', unit: 'cucharadas' },
          { ingredient: vinaigreBalsámico, quantity: '2', unit: 'cucharadas' },
          { ingredient: orégano, quantity: '1', unit: 'cucharadita', notes: 'seco' },
          { ingredient: ajo, quantity: '1', unit: 'diente', notes: 'machacado' },
          { ingredient: nueces, quantity: '1/3', unit: 'taza', notes: 'picadas' },
          { ingredient: albahaca, quantity: '1/4', unit: 'taza', notes: 'fresca' }
        ].filter(item => item.ingredient),
        requiredToolsData: [olla, colador, tazonesMezcla, cuchilloChef, tablaCortar].filter(Boolean)
      },

      // COMIDA RECONFORTANTE
      {
        title: 'Arroz con Pollo Gourmet',
        description: 'Versión elegante del clásico arroz con pollo, con sabores profundos y presentación restaurante.',
        preparationTimeMinutes: 20,
        cookingTimeMinutes: 35,
        servings: 6,
        steps: [
          'Cortar el pollo en trozos uniformes y sazonar con sal y pimienta',
          'Calentar aceite en una olla grande, dorar el pollo por todos lados',
          'Retirar el pollo y en la misma olla sofreír cebolla, ajo y pimiento',
          'Agregar el tomate picado y cocinar hasta que se ablande',
          'Incorporar el arroz y tostar ligeramente por 2 minutos',
          'Agregar el caldo caliente, azafrán, paprika y orégano',
          'Devolver el pollo a la olla, llevar a ebullición',
          'Reducir fuego, tapar y cocinar 20 minutos sin destapar',
          'Dejar reposar 5 minutos antes de servir',
          'Decorar con cilantro fresco y servir con limón'
        ],
        recipeIngredientsData: [
          { ingredient: pollo, quantity: '1', unit: 'kg', notes: 'en trozos grandes' },
          { ingredient: arroz, quantity: '2', unit: 'tazas', notes: 'grano largo' },
          { ingredient: caldoPollo, quantity: '4', unit: 'tazas', notes: 'caliente' },
          { ingredient: cebolla, quantity: '1', unit: 'unidad', notes: 'grande, picada' },
          { ingredient: ajo, quantity: '4', unit: 'dientes', notes: 'machacados' },
          { ingredient: pimientoRojo, quantity: '1', unit: 'unidad', notes: 'en tiras' },
          { ingredient: tomate, quantity: '2', unit: 'unidades', notes: 'pelados y picados' },
          { ingredient: aceiteOliva, quantity: '3', unit: 'cucharadas' },
          { ingredient: paprika, quantity: '1', unit: 'cucharadita' },
          { ingredient: orégano, quantity: '1', unit: 'cucharadita' },
          { ingredient: cilantro, quantity: '1/4', unit: 'taza', notes: 'para decorar' },
          { ingredient: sal, quantity: 'al gusto', unit: '' },
          { ingredient: pimienta, quantity: 'al gusto', unit: '' }
        ].filter(item => item.ingredient),
        requiredToolsData: [ollaGrande, cuchilloChef, tablaCortar, tazasMedidoras].filter(Boolean)
      },

      // POSTRES
      {
        title: 'Mousse de Chocolate Negro',
        description: 'Postre elegante y decadente con chocolate negro de alta calidad. Textura sedosa que se derrite en la boca.',
        preparationTimeMinutes: 20,
        cookingTimeMinutes: 10,
        servings: 6,
        steps: [
          'Derretir el chocolate negro al baño maría hasta que esté completamente liso',
          'Separar las claras de las yemas de huevo',
          'Batir las yemas con azúcar hasta que estén pálidas y espumosas',
          'Incorporar el chocolate derretido tibio a las yemas batiendo constantemente',
          'En otro bowl, batir las claras a punto de nieve con una pizca de sal',
          'Incorporar 1/3 de las claras al chocolate con movimientos envolventes',
          'Agregar el resto de las claras en dos tandas, mezclando suavemente',
          'Distribuir en copas individuales',
          'Refrigerar mínimo 4 horas o toda la noche',
          'Servir decorado con fresas frescas y un toque de crema'
        ],
        recipeIngredientsData: [
          { ingredient: chocolateNegro, quantity: '200', unit: 'gramos', notes: '70% cacao, picado' },
          { ingredient: huevo, quantity: '4', unit: 'unidades', notes: 'separadas' },
          { ingredient: azúcar, quantity: '60', unit: 'gramos' },
          { ingredient: cremaLeche, quantity: '2', unit: 'cucharadas', notes: 'para decorar' },
          { ingredient: fresas, quantity: '6', unit: 'unidades', notes: 'para decorar' },
          { ingredient: sal, quantity: '1', unit: 'pizca' }
        ].filter(item => item.ingredient),
        requiredToolsData: [tazonesMezcla, batidora, microondas].filter(Boolean)
      }
    ];

    // Validar que tengamos ingredientes básicos
    if (!pollo || !arroz || !sal || !aceiteOliva) {
      this.logger.error('Faltan ingredientes básicos para crear las recetas');
      return;
    }

    for (const recipeData of recipesToSeed) {
      const { recipeIngredientsData, requiredToolsData, ...recipeDetails } = recipeData;

      const newRecipe = this.recipeRepository.create(recipeDetails);
      newRecipe.recipeIngredients = [];
      newRecipe.requiredTools = [];

      // Procesar RecipeIngredients
      if (recipeIngredientsData?.length) {
        for (const riData of recipeIngredientsData) {
          if (!riData.ingredient) {
            this.logger.warn(`Ingrediente no encontrado para "${newRecipe.title}"`);
            continue;
          }
          const recipeIngredient = new RecipeIngredient();
          recipeIngredient.ingredient = riData.ingredient;
          recipeIngredient.quantity = riData.quantity;
          recipeIngredient.unit = riData.unit || '';
          recipeIngredient.notes = riData.notes || '';
          recipeIngredient.recipe = newRecipe;
          newRecipe.recipeIngredients.push(recipeIngredient);
        }
      }

      // Procesar RequiredTools
      if (requiredToolsData?.length) {
        newRecipe.requiredTools = requiredToolsData.filter(tool => {
          if (!tool) {
            this.logger.warn(`Herramienta no encontrada para "${newRecipe.title}"`);
          }
          return !!tool;
        });
      }

      try {
        await this.recipeRepository.save(newRecipe);
        this.logger.log(`✅ Receta "${newRecipe.title}" creada exitosamente`);
      } catch (error) {
        this.logger.error(`❌ Error creando receta "${newRecipe.title}":`, error);
      }
    }

    this.logger.log(`🎉 Se crearon ${recipesToSeed.length} recetas profesionales`);
  }
}
