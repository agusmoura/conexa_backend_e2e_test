# Conexa - Backend Nest SSR Test (E2E) 🚀

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

## 📝 Descripción

Este es un backend desarrollado en NestJS para la gestión de películas, integrado con la API de Star Wars. El proyecto incluye autenticación JWT, gestión de usuarios y roles, operaciones CRUD de películas, y sincronización con la API de Star Wars. Este proyecto fue creado como parte de una prueba técnica para Conexa.

## ✨ Características principales

- 🔐 Autenticación y autorización con JWT
- 👥 Gestión de usuarios con roles (Admin y User)
- 🎬 Operaciones CRUD para películas
- 🌟 Integración con la API de Star Wars para sincronización de datos
- 📚 Documentación de API con Swagger
- 🧪 Pruebas unitarias y de integración (E2E)

## 🛠️ Requisitos previos

- Node.js (versión 14 o superior)
- npm (gestor de paquetes de Node.js)
- PostgreSQL (base de datos)

## 🚀 Configuración del proyecto

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/conexa-backend-e2e-test.git
   cd conexa-backend-e2e-test
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias:

   ```env

   ```

4. Ejecuta las migraciones de la base de datos:
   ```
   npm run typeorm migration:run
   ```

## 🏃‍♂️ Ejecución del proyecto

Para ejecutar el proyecto en modo de desarrollo:

```
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`.

## 📖 Documentación de la API

La documentación de la API está disponible a través de Swagger UI. Puedes acceder a ella en:
`http://localhost:3000/api/docs`.

## 🧪 Pruebas

Para ejecutar las pruebas unitarias:

```
npm run test
```

Para ejecutar las pruebas de integración (E2E):

```
npm run test:e2e
```

Para obtener la cobertura de pruebas:

```
npm run test:cov
```

## 📁 Estructura del proyecto

- `src/`: Contiene el código fuente del proyecto.
  - `auth/`: Módulo de autenticación.
  - `users/`: Módulo de gestión de usuarios.
  - `movies/`: Módulo de gestión de películas.
  - `star-wars/`: Módulo de integración con la API de Star Wars.
  - `posters/`: Módulo de gestión de posters.
  - `app.module.ts`: Módulo principal de la aplicación.
  - `main.ts`: Punto de entrada de la aplicación.
- `test/`: Contiene las pruebas unitarias y de integración.
- `apps/`: Contiene la aplicación NestJS.

## 🤝 Contribuciones

Si deseas contribuir al proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -am 'Añade nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un nuevo Pull Request

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 📞 Contacto

Si tienes alguna pregunta o sugerencia, no dudes en contactarme:

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/agustin-mourino/)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/agus_moura)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:agus442m@gmail.com)
