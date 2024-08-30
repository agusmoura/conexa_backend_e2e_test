import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { CreateUserDto , UpdateUserDto} from '@/users/dto/users.dto';
import { DataSource } from 'typeorm';
import { UsersService } from '@/users/users.service';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let dataSource: DataSource;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
      dataSource = app.get(DataSource);
    });

    afterAll(async () => {
      await dataSource.dropDatabase();
      await app.close();
    });

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
      app.useLogger(new Logger());

      /* crear un usuario admin para la pruebas */
      const user: CreateUserDto = {
        username: 'admin',
        password: 'admin',
      };

      const userService = app.get(UsersService);
      await userService.createAdmin(user);

      /* hacer login para obtener el token */
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin' })
        .expect(200);

      adminToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
      const dataSource = app.get(DataSource);
      await dataSource.synchronize(true);
      await app.close();
    });

    /* -------- Success Tests -------- */


    it('/users (POST) - deberia crear un nuevo usuario', async () => {
      try {
        const user: CreateUserDto = {
          username: 'testuser',
          password: 'testpass'
        };

        const response = await request(app.getHttpServer())
          .post('/users')
          .send(user)
          .expect(201);

        expect(response.body).toEqual({
          id: expect.any(Number),
          username: 'testuser',
          role: 'user',
          message: 'Usuario creado exitosamente'
        });
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
    });

    it('/users (GET) - deberia obtener todos los usuarios - (ADMIN)', async () => {
      try {
        const response = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
    });

    it('/users/:id (PUT) - deberia actualizar un usuario - (ADMIN)', async () => {
        try {
            const user: CreateUserDto = {
                username: 'testuser',
                password: 'testpass'
              };
              
              const createResponse = await request(app.getHttpServer())
                .post('/users')
                .send(user)
                .expect(201);

            const updateUser: UpdateUserDto = {
                username: 'updateduser',
                password: 'updatedpass'
              };

            const updateResponse = await request(app.getHttpServer())
                .put(`/users/${createResponse.body.id}`)
                .send(updateUser)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(updateResponse.body).toEqual({
                id: createResponse.body.id,
                username: 'updateduser',
                message: 'Usuario actualizado exitosamente'
            });
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

    it('/users/:id (DELETE) - deberia eliminar un usuario - (ADMIN)', async () => {
        try {
            const user: CreateUserDto = {
                username: 'testuser',
                password: 'testpass'
              };
              
            const createResponse = await request(app.getHttpServer())
                .post('/users')
                .send(user)
                .expect(201);


            const deleteResponse = await request(app.getHttpServer())
                .delete(`/users/${createResponse.body.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(deleteResponse.body).toEqual({
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

    /* -------- Error Tests -------- */

    it('/users (GET) - deberia retornar un error 401 si no se proporciona un token', async () => {
        try {
            await request(app.getHttpServer())
              .get('/users')
              .expect(401);
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

    it('/users (GET) - deberia retornar un error 403 si el token no es valido', async () => {
        try {
            await request(app.getHttpServer())
              .get('/users')
              .set('Authorization', `Bearer invalidtoken`)
              .expect(401);
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

    it('/users (GET) - deberia retornar un error 403 si el token no tiene el rol de admin', async () => {
        try {
            const user: CreateUserDto = {
                username: 'testuser',
                password: 'testpass'
              };
              
            const createResponse = await request(app.getHttpServer())
                .post('/users')
                .send(user)
                .expect(201);

            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'testuser', password: 'testpass' })
                .expect(200);

            const userToken = loginResponse.body.access_token;

            await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

    it('/users (GET) - deberia retornar un error 404 si el usuario no existe', async () => {
        try {
            const nonExistentUserId = 99999;

            await request(app.getHttpServer())
                .get(`/users/${nonExistentUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

    it('/users (PUT) - deberia retornar un error 404 si el usuario no existe', async () => {
        try {
            const nonExistentUserId = 99999;

            const updateUser: UpdateUserDto = {
                username: 'updateduser',
                password: 'updatedpass'
              };

            await request(app.getHttpServer())
                .put(`/users/${nonExistentUserId}`)
                .send(updateUser)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

    it('/users (DELETE) - deberia retornar un error 404 si el usuario no existe', async () => {
        try {
            const nonExistentUserId = 99999;

            await request(app.getHttpServer())
                .delete(`/users/${nonExistentUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });

});
