import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import { LoginDto } from '@/auth/dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let token: string;
    let userCredentials: LoginDto;
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

        userCredentials = {
            username: configService.get<string>('BASE_USER_USERNAME'),
            password: configService.get<string>('BASE_USER_PASSWORD')
        };

    });

    afterAll(async () => {
        const dataSource = app.get(DataSource);
        await dataSource.dropDatabase();
        await app.close();
    });

    describe('POST /auth/login', () => {
        it('debería iniciar sesión con credenciales válidas', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(userCredentials)
                .expect(200);

            token = response.body.access_token;

            expect(response.body).toEqual({
                access_token: expect.any(String),
                token_type: 'Bearer',
                expires_in: expect.any(Number),
                message: 'Inicio de sesión exitoso'
            });
        });

        it('debería devolver un error 401 para credenciales inválidas', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({...userCredentials, password: 'wrongpass'})
                .expect(401);

            expect(response.body).toEqual({
                statusCode: 401,
                message: 'Credenciales inválidas',
                error: 'Unauthorized'
            });
        });
    });

    describe('POST /auth/change-password', () => {
        it('debería cambiar la contraseña de un usuario autenticado', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: userCredentials.username,
                    oldPassword: userCredentials.password,
                    newPassword: 'newpass123',
                    confirmNewPassword: 'newpass123'
                })
                .expect(200);

            expect(response.body).toEqual({
                message: 'Contraseña actualizada exitosamente'
            });

            userCredentials.password = 'newpass123';
        });

        it('debería devolver un error 400 para contraseñas no coincidentes', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: userCredentials.username,
                    oldPassword: userCredentials.password,
                    newPassword: 'wrongpass',
                    confirmNewPassword: 'morewrongpass'
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                message: 'Las contraseñas no coinciden',
                error: 'Bad Request'
            });
        });

        it('debería devolver un error 401 para token inválido', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', 'Bearer invalidtoken')
                .send({
                    username: userCredentials.username,
                    oldPassword: userCredentials.password,
                    newPassword: 'newpass',
                    confirmNewPassword: 'newpass'
                })
                .expect(401);

            expect(response.body).toEqual({
                statusCode: 401,
                message: 'Token no válido o expirado',
                error: 'Unauthorized'
            });
        });

        it('debería devolver un error 401 para contraseña antigua incorrecta', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: userCredentials.username,
                    oldPassword: 'wrongoldpassword',
                    newPassword: 'newpass',
                    confirmNewPassword: 'newpass'
                })
                .expect(401);

            expect(response.body).toEqual({
                statusCode: 401,
                message: 'Credenciales inválidas',
                error: 'Unauthorized'
            });
        });
    });
});

