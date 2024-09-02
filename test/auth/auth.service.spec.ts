import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@/users/users.entity';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '@/auth/dto/auth.dto';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: UserRole.USER,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findOneByUsername: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        validateUser: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mocktoken'),
                        decode: jest.fn().mockReturnValue({ payload: { exp: 1234567890 } }),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);

        (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(true));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    it('debería estar definido', () => {
        expect(authService).toBeDefined();
    });

    describe('create', () => {
        it('debería crear un nuevo usuario', async () => {
            const signUpDto = { username: 'newuser', password: 'password123' };
            jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(null);
            jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

            const result = await usersService.create(signUpDto);
            expect(result).toEqual({
                id: mockUser.id,
                username: mockUser.username,
                password: mockUser.password,
                role: mockUser.role
            });
        });

        it('debería lanzar ConflictException si el usuario ya existe', async () => {
            const signUpDto = { username: 'existinguser', password: 'password123' };
            jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(mockUser);
            jest.spyOn(usersService, 'create').mockRejectedValue(new ConflictException('El usuario ya existe'));

            await expect(usersService.create(signUpDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('debería devolver un token si las credenciales son válidas', async () => {
            const loginDto: LoginDto = { username: 'testuser', password: 'correctpassword' };
            jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(mockUser);
            jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.login(loginDto);

            expect(result).toEqual({
                access_token: 'mocktoken',
                token_type: 'Bearer',
                expires_in: 1234567890,
                message: 'Inicio de sesión exitoso'
            });
        });

        it('debería lanzar UnauthorizedException si las credenciales son inválidas', async () => {
            const loginDto = { username: 'testuser', password: 'wrongpassword' };
            jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Mockear el método validateUser para que devuelva null
            jest.spyOn(usersService, 'validateUser').mockResolvedValue(null);

            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
