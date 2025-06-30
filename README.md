# Aplicación de Recetas API con NestJS
## De que es este proyecto?
Una app que permite crear recetas personalizadas de acuerdo a los ingredientes que posea el usuario

## PRINCIPIOS Y PATRONES APLICADOS
### Link demostracion en YT
https://youtu.be/1Gl_y6ByAwI

### Principio SRP - Single Responsibility Principle

- Se dividio el UsersService en servicios especializados como user-inventoy.service y user-profile.service cada uno con su propia responsabilidad sin tener todo en un mismo servicio como era en el 'user.service'

- Antes:<br>
class UsersService { <br>
  create()<br>
  updateProfile()<br>
  addIngredient()<br>
}

- Ahora:<br>
class UserProfileService {<br>
  create()<br>
  updateProfile()<br>
}

class UserInventoryService {<br>
  addIngredient()<br>
  removeIngredient()<br>
}

### Principio SRP - Dependency Inversion Principle

- Integré  interfaces (puertos out) que definen contratos, entonces ahora los servicios dependen de abstracciones, no de implementaciones concretas.

- Antes:<br>
class UserProfileService {<br>
  constructor(<br>
    @InjectRepository(User) private userRepo: Repository<User><br>
  ) {}<br>
}

- Ahora:<br>
class UserProfileService {<br>
  constructor(<br>
    @Inject('UserRepositoryPort') private userRepo: UserRepositoryPort<br>
  ) {}<br>
}

### Patrón Strategy

Se extrajo logica de sugerencias de recetas a estrategias intercambiables, entonces creé un contexto que gestiona las diferentes strategies.

- Antes:<br>
class RecipesService {<br>
  suggestRecipes() {<br>
  }<br>
}

- Ahora:<br>
interface RecipeSuggestionStrategy {<br>
  execute(userId: string): Promise<SuggestRecipesResponseDto>;<br>
}

class InventoryMatchStrategy implements RecipeSuggestionStrategy {<br>
  execute(userId: string)<br>
}

class RecipeSuggestionContextService {<br>
  suggestByInventory(userId: string) {<br>
    return this.inventoryStrategy.execute(userId);<br>
  }<br>
}

### Patrón Builder

Se creó un builder para construir recetas complejas paso a paso, ademas se encapsula la validación y se crea en un objeto reutilizable.
Cambiando la lógica de creación repetitiva y compleja en RecipesService

- Antes:<br>
class RecipesService {<br>
  async create(dto: CreateRecipeDto) {<br>
    // Lógica de ingredientes<br>
    // Lógica de herramientas<br>
    // Validaciones en update()<br>
  }<br>
}

- Ahora:<br>
class RecipeBuilder {<br>
  withBasicInfo(data)<br>
  withSteps(steps)<br>
  async addIngredients(ingredients)<br>
  async addTools(tools)<br>
  async build()<br>
}

const recipe = await this.recipeBuilder.createNew()<br>
  .withBasicInfo(recipeDetails)<br>
  .withSteps(steps)<br>
  .addIngredients(ingredients)<br>
  .addTools(tools)<br>
  .build();<br>


## Rutas 

### Autenticación
| Método | Ruta              | Descripción                    |
|--------|-------------------|--------------------------------|
| POST   | `/auth/register`  | Registra un nuevo usuario      |
| POST   | `/auth/login`     | Inicia sesión y obtiene JWT    |

### Recetas (Protegida JWT)
| Método | Ruta                                    | Descripción                              |
|--------|-----------------------------------------|------------------------------------------|
| GET    | `/recipes`                              | Obtiene todas las recetas                |
| GET    | `/recipes/:id`                          | Obtiene una receta específica            |
| POST   | `/recipes`                              | Crea una nueva receta                    |
| PUT    | `/recipes/:id`                          | Actualiza una receta                     |
| DELETE | `/recipes/:id`                          | Elimina una receta                       |
| POST   | `/recipes/suggest-by-my-inventory-detailed` | ** Sugerencias inteligentes automáticas** |
| POST   | `/recipes/edit-recipe`                  | Personaliza una receta con sustituciones |
| GET    | `/recipes/:id/instructions`             | Obtiene instrucciones detalladas         |

### Ingredientes (Protegida JWT)
| Método | Ruta                    | Descripción                           |
|--------|-------------------------|---------------------------------------|
| GET    | `/ingredients`          | Lista todos los ingredientes          |
| POST   | `/users/ingredients`    | Selecciona ingredientes disponibles   |
| GET    | `/users/ingredients`    | Obtiene tu inventario de ingredientes |

### Retroalimentación (Protegida JWT)
| Método | Ruta                           | Descripción                        |
|--------|--------------------------------|------------------------------------|
| POST   | `/recipes/feedback`            | Crea calificación y comentario     |
| GET    | `/recipes/:id/feedback`        | Obtiene feedback de una receta     |
| GET    | `/recipes/:id/average-rating`  | Obtiene calificación promedio      |

## Flujo de Uso

1. *Registro/Login* → Obtener token JWT
2. *Seleccionar ingredientes* → Actualizar tu inventario disponible  
3. *Buscar sugerencias* → El sistema te recomienda recetas basadas en tus ingredientes
4. *Revisar opciones* → Ver porcentaje de coincidencia e ingredientes faltantes
5. *Decidir**: 
   -*Cocinar tal como está* → Obtener instrucciones detalladas
   -*Personalizar* → Sustituir ingredientes y adaptar pasos
6. *Cocinar y calificar* → Dejar feedback para mejorar el sistema

## Muestra trabajo con JIRA
![image](https://github.com/user-attachments/assets/1307c8a1-436b-402c-afc1-3c2f680658ed)


## Link demostracion en YT
https://youtu.be/0LlUwpMhDk8
