# Aplicación de Recetas API con NestJS

## ¿Qué es este proyecto?

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
