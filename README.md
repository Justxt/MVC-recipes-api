# Aplicación de Recetas API con NestJS

## PRINCIPIOS Y PATRONES APLICADOS

### Principio SRP - Single Responsibility Principle

- Se dividio el UsersService en servicios especializados como user-inventoy.service y user-profile.service cada uno con su propia responsabilidad sin tener todo en un mismo servicio como era en el 'user.service'

- Antes:
class UsersService {
  create()
  updateProfile()
  addIngredient()
}

- Ahora:
class UserProfileService {
  create()
  updateProfile()
}

class UserInventoryService {
  addIngredient()
  removeIngredient()
}

### Principio SRP - Dependency Inversion Principle

- Integré  interfaces (puertos out) que definen contratos, entonces ahora los servicios dependen de abstracciones, no de implementaciones concretas.

- Antes:
class UserProfileService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}
}

- Ahora:
class UserProfileService {
  constructor(
    @Inject('UserRepositoryPort') private userRepo: UserRepositoryPort
  ) {}
}

### Patrón Strategy

Se extrajo logica de sugerencias de recetas a estrategias intercambiables, entonces creé un contexto que gestiona las diferentes strategies.

- Antes:
class RecipesService {
  suggestRecipes() {
  }
}

- Ahora:
interface RecipeSuggestionStrategy {
  execute(userId: string): Promise<SuggestRecipesResponseDto>;
}

class InventoryMatchStrategy implements RecipeSuggestionStrategy {
  execute(userId: string)
}

class RecipeSuggestionContextService {
  suggestByInventory(userId: string) {
    return this.inventoryStrategy.execute(userId);
  }
}

### Patrón Builder

Se creó un builder para construir recetas complejas paso a paso, ademas se encapsula la validación y creación en un objeto reutilizable

## De que es este proyecto?

Una app que permite crear recetas personalizadas de acuerdo a los ingredientes que posea el usuario

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
