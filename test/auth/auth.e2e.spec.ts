import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let token: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        app.useLogger(new Logger());


        await request(app.getHttpServer())
          .post('/users')
          .send({ username: 'testuser', password: 'testpass' })
          .expect(201);
    });
    

    afterAll(async () => {
        const dataSource = app.get(DataSource);
        await dataSource.dropDatabase();
        await app.close();
    });


    /* -------- Success Tests -------- */

    it('/auth/login (POST) - debería iniciar sesión con credenciales válidas', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: 'testuser', password: 'testpass' })
          .expect(200);

          token = response.body.access_token;

          expect(response.body).toHaveProperty('access_token');
          expect(response.body).toHaveProperty('token_type');
          expect(response.body).toHaveProperty('expires_in');


    });

    it('/auth/change-password (POST) - debería cambiar la contraseña de un usuario', async () => {
        const changePasswordResponse = await request(app.getHttpServer())
          .post('/auth/change-password')
          .set('Authorization', `Bearer ${token}`)
          .send({ username: 'testuser', oldPassword: 'testpass', newPassword: 'newpass', confirmNewPassword: 'newpass' })
          .expect(200);

        expect(changePasswordResponse.body).toHaveProperty('message', 'Contraseña actualizada exitosamente');
    });


    /* -------- Error Tests -------- */

    it('/auth/login (POST) - debería devolver un error para credenciales inválidas', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: 'testuser', password: 'wrongpass' })
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    });


    it('/auth/change-password (POST) - debería devolver un error para contraseñas no coincidentes', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: 'testuser', password: 'newpass' })
          .expect(200);
        const token = loginResponse.body.access_token;

        const changePasswordResponse = await request(app.getHttpServer())
          .post('/auth/change-password')
          .set('Authorization', `Bearer ${token}`)
          .send({ username: 'testuser', oldPassword: 'newpass', newPassword: 'wrongpass', confirmNewPassword: 'morewrongpass' })
          .expect(400);

        expect(changePasswordResponse.body).toHaveProperty('message', 'Las contraseñas no coinciden');
    });

    it('/auth/change-password (POST) - deberia devolver error para bearer token invalido', async () => {
      const changePasswordResponse = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer invalidtoken`)
        .send({ username: 'testuser', oldPassword: 'testpass', newPassword: 'newpass', confirmNewPassword: 'newpass' })
        .expect(401);

      expect(changePasswordResponse.body).toHaveProperty('message', 'Unauthorized');
    });


});

