import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { Movie } from '@/movies/movies.entity';
import { DataSource } from 'typeorm';

describe('MoviesController (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        app.useLogger(new Logger());

        /* hacer login para obtener el token del admin */
        const loginAdminResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'admin', password: process.env.BASE_ADMIN_PASSWORD })
            .expect(200);
        adminToken = loginAdminResponse.body.access_token;
        
        /* hacer login para obtener el token del usuario */
        const loginUserResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'user', password: process.env.BASE_USER_PASSWORD })
            .expect(200);
        userToken = loginUserResponse.body.access_token;

        /* sincronizar películas antes de ejecutar los tests */
        await request(app.getHttpServer())
            .post('/movies/sync')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });

    afterAll(async () => {
        /* eliminar las películas creadas en los tests */
        const dataSource = app.get(DataSource);
        await dataSource.synchronize(true);
        await app.close();
    });

    describe('GET /movies', () => {
        it('debería obtener una lista de películas', async () => {
            const response = await request(app.getHttpServer())
                .get('/movies')
                .expect(200);

            expect(response.body).toEqual({
                message: 'Películas obtenidas exitosamente',
                data: expect.any(Array)
            });
        });

        it('debería devolver un error 404 al intentar obtener una película inexistente', async () => {
            const respuesta = await request(app.getHttpServer())
                .get('/movies/PeliculaInexistente')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(404);

            expect(respuesta.body).toEqual({
                statusCode: 404,
                message: 'Película no encontrada',
                error: 'Not Found'
            });
        });
    });

    describe('POST /movies', () => {
        it('debería crear una nueva película (ADMIN)', async () => {
            const movie: Movie = {
                id: 1,
                title: 'Pelicula de prueba',
                episode_id: 1,
                opening_crawl: 'Esta es una pelicula de prueba',
                director: 'Director de prueba',
                producer: 'Productor de prueba',
                release_date: new Date(),
                url: 'https://swapi.dev/api/films/1/',
                characters: [],
                planets: [],
                starships: [],
                vehicles: [],
                species: [],
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                poster: null,
            };

            const response = await request(app.getHttpServer())
                .post('/movies')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(movie)
                .expect(201);

            expect(response.body).toEqual({
                message: 'Película creada exitosamente',
                data: expect.any(Object)
            });
        });

        it('debería devolver un error 403 al intentar crear una película sin permisos de administrador (USER)', async () => {
            const peliculaNueva: Partial<Movie> = {
                title: 'Película no autorizada',
                episode_id: 999,
                opening_crawl: 'Esta película no debería crearse',
                director: 'Usuario sin permisos',
                producer: 'Usuario sin permisos',
                release_date: new Date(),
            };

            const respuesta = await request(app.getHttpServer())
                .post('/movies')
                .set('Authorization', `Bearer ${userToken}`)
                .send(peliculaNueva)
                .expect(403);

            expect(respuesta.body).toEqual({
                statusCode: 403,
                message: 'Forbidden resource',
                error: 'Forbidden'
            });
        });

        it('debería devolver un error 400 al intentar crear una película con datos inválidos (ADMIN)', async () => {
            const peliculaInvalida = {
                title: '',
                episode_id: 'no es un número',
            };

            const respuesta = await request(app.getHttpServer())
                .post('/movies')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(peliculaInvalida)
                .expect(400);

            expect(respuesta.body).toEqual({
                statusCode: 400,
                message: 'Error al crear la película: la sintaxis de entrada no es válida para tipo integer: «no es un número»',
                error: 'Bad Request'
            });
        });
    });

    describe('PUT /movies/:id', () => {
        it('debería actualizar una película existente (ADMIN)', async () => {
            const movie: Movie = {
                id: 1,
                title: 'Pelicula de prueba',
                episode_id: 1,
                opening_crawl: 'Esta es una pelicula de prueba',
                director: 'Director de prueba',
                producer: 'Productor de prueba',
                release_date: new Date(),
                url: 'https://swapi.dev/api/films/1/',
                poster: null,
                characters: [],
                planets: [],
                starships: [],
                vehicles: [],
                species: [],
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
            };

            const response = await request(app.getHttpServer())
                .put('/movies/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(movie)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Película actualizada exitosamente',
                data: expect.any(Object)
            });
        });

        it('debería devolver un error 404 al intentar actualizar una película inexistente (ADMIN)', async () => {
            const peliculaActualizada: Partial<Movie> = {
                title: 'Película actualizada',
                director: 'Director actualizado',
            };

            const respuesta = await request(app.getHttpServer())
                .put('/movies/9999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(peliculaActualizada)
                .expect(404);

            expect(respuesta.body).toEqual({
                statusCode: 404,
                message: 'Película no encontrada',
                error: 'Not Found'
            });
        });
    });

    describe('DELETE /movies/:id', () => {
        it('debería eliminar una película existente (ADMIN)', async () => {
            const response = await request(app.getHttpServer())
                .delete('/movies/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(204);

            expect(response.body).toEqual({});
        });

        it('debería devolver un error 403 al intentar eliminar una película sin permisos de administrador (USER)', async () => {
            const respuesta = await request(app.getHttpServer())
                .delete('/movies/1')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(respuesta.body).toEqual({
                statusCode: 403,
                message: 'Forbidden resource',
                error: 'Forbidden'
            });
        });
    });

    describe('POST /movies/sync', () => {
        it('debería sincronizar las películas exitosamente (ADMIN)', async () => {
            const response = await request(app.getHttpServer())
                .post('/movies/sync')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Listado de películas sincronizado exitosamente'
            });
        });

        it('debería devolver un error 403 al intentar sincronizar las películas sin permisos de administrador (USER)', async () => {
            const respuesta = await request(app.getHttpServer())
                .post('/movies/sync')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(respuesta.body).toEqual({
                statusCode: 403,
                message: 'Forbidden resource',
                error: 'Forbidden'
            });
        });
    });
});

