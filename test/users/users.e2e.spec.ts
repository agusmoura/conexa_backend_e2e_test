import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { CreateUserDto, UpdateUserDto } from '@/users/dto/users.dto';
import { DataSource } from 'typeorm';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let userToken: string;
    let configService: ConfigService;
    let usersService: UsersService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        configService = moduleFixture.get<ConfigService>(ConfigService);
        usersService = moduleFixture.get<UsersService>(UsersService);

        app = moduleFixture.createNestApplication();
        await app.init();
        app.useLogger(new Logger());

        // Crear usuario admin y obtener token
        const adminCredentials = {
            username: configService.get<string>('BASE_ADMIN_USERNAME'),
            password: configService.get<string>('BASE_ADMIN_PASSWORD')
        };

        const loginAdminResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send(adminCredentials)
            .expect(200);
        adminToken = loginAdminResponse.body.access_token;

        // Crear usuario normal y obtener token
        const userCredentials = {
            username: configService.get<string>('BASE_USER_USERNAME'),
            password: configService.get<string>('BASE_USER_PASSWORD')
        };

        const loginUserResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send(userCredentials)
            .expect(200);
        userToken = loginUserResponse.body.access_token;
    });

    afterAll(async () => {
        const dataSource = app.get(DataSource);
        await dataSource.dropDatabase();
        await app.close();
    });

    describe('POST /users', () => {
        it('debería crear un nuevo usuario', async () => {
            const user: CreateUserDto = {
                username: 'newtestuser',
                password: 'testpass'
            };

            const response = await request(app.getHttpServer())
                .post('/users')
                .send(user)
                .expect(201);

            expect(response.body).toEqual({
                id: expect.any(Number),
                username: 'newtestuser',
                role: 'user',
                message: 'Usuario creado exitosamente'
            });
        });

        it('debería devolver un error 409 al intentar crear un usuario que ya existe', async () => {
            const existingUser: CreateUserDto = {
                username: configService.get<string>('BASE_USER_USERNAME'),
                password: 'somepassword'
            };

            const response = await request(app.getHttpServer())
                .post('/users')
                .send(existingUser)
                .expect(409);

            expect(response.body).toEqual({
                statusCode: 409,
                message: 'El usuario ya existe',
                error: 'Conflict'
            });
        });
    });

    describe('GET /users', () => {
        it('debería obtener todos los usuarios (ADMIN)', async () => {
            const response = await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('debería devolver un error 403 al intentar obtener usuarios sin ser admin', async () => {
            const response = await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(response.body).toEqual({
                statusCode: 403,
                message: 'Forbidden resource',
                error: 'Forbidden'
            });
        });
    });

    describe('PUT /users/:id', () => {
        it('debería actualizar un usuario existente (ADMIN)', async () => {
            const updateUser: UpdateUserDto = {
                username: 'updateduser',
                password: 'updatedpass'
            };

            const response = await request(app.getHttpServer())
                .put(`/users/2`)
                .send(updateUser)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toEqual({
                id: 2,
                username: 'updateduser',
                message: 'Usuario actualizado exitosamente'
            });
        });

        it('debería devolver un error 404 al intentar actualizar un usuario inexistente', async () => {
            const updateUser: UpdateUserDto = {
                username: 'nonexistentuser',
                password: 'somepassword'
            };

            const response = await request(app.getHttpServer())
                .put('/users/9999')
                .send(updateUser)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                message: 'Usuario no encontrado',
                error: 'Not Found'
            });
        });
    });

    describe('DELETE /users/:id', () => {
        it('debería eliminar un usuario existente (ADMIN)', async () => {
          /* crea un usuario temporal */
          const tempUser: CreateUserDto = {
            username: 'tempuser',
            password: 'temppass'
          };

          const createResponse = await request(app.getHttpServer())
            .post('/users')
            .send(tempUser)
            .expect(201);

          const response = await request(app.getHttpServer())
            .delete(`/users/${createResponse.body.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

            expect(response.body).toEqual({
                message: 'Usuario eliminado exitosamente'
            });
        });

        it('debería devolver un error 404 al intentar eliminar un usuario inexistente', async () => {
            const response = await request(app.getHttpServer())
                .delete('/users/9999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                message: 'Usuario no encontrado',
                error: 'Not Found'
            });
        });
    });
});
