
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: UsersService,
            useValue: {
              findOneByUsername: jest.fn(),
              create: jest.fn(),
            },
          },
          {
            provide: JwtService,
            useValue: {
              sign: jest.fn(),
            },
          },
        ],
      }).compile();
  
      authService = module.get<AuthService>(AuthService);
      usersService = module.get<UsersService>(UsersService);
      jwtService = module.get<JwtService>(JwtService);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    /* TODO: Agregar pruebas para los metodos de AuthService */

  
  
});
