import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '@/users/users.entity';
import { CreateUserAdminDto, CreateUserDto, UpdateUserDto } from '@/users/dto/users.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthDto } from '@/auth/dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<Object> {
        const { username, password, role } = createUserDto;

        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new ConflictException('El usuario ya existe');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userCreated = this.userRepository.create({ username, password: hashedPassword, role });
        const saveUser = await this.userRepository.save(userCreated);

        return {
            id: saveUser.id,
            username: saveUser.username,
            role: saveUser.role,
            message: 'Usuario creado exitosamente',
        }
    }

    /* reservado unicamente para uso interno */
    async createAdmin(createUserAdminDto: CreateUserAdminDto): Promise<Object> {
        const { username, password } = createUserAdminDto;
        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new ConflictException('El usuario ya existe');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userCreated = this.userRepository.create({ 
            username, 
            password: hashedPassword, 
            role: UserRole.ADMIN
        });
        const saveUser = await this.userRepository.save(userCreated);

        return {
            id: saveUser.id,
            username: saveUser.username,
            role: saveUser.role,
            message: 'Usuario administrador creado exitosamente',
        }
    }
    

    async validateUser(authDto: AuthDto): Promise<User | null> {
        const { username, password } = authDto;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = user && await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        return user;
    }

    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find();

        if (users.length === 0) {
            throw new NotFoundException('No se encontraron usuarios');
        }
        return users;
    }

    async findOneByUsername(username: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<Object> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const { username, password, role } = updateUserDto;
        user.username = username;
        user.password = password;
        user.role = role;
        const updatedUser = await this.userRepository.save(user);
        if (!updatedUser) {
            throw new InternalServerErrorException('Error al actualizar el usuario');
        }
        return {
            id: updatedUser.id,
            username: updatedUser.username,
            role: updatedUser.role,
            message: 'Usuario actualizado exitosamente',
        }
    }

    async remove(id: number): Promise<Object> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        const result = await this.userRepository.delete({ id });
        if (result.affected === 0) {
            throw new InternalServerErrorException('Error al eliminar el usuario');
        }
        return {
            message: 'Usuario eliminado exitosamente',
        }
    }

    async createInitialUsers(): Promise<void> {
        const baseUser = await this.userRepository.findOne({ where: { username: 'user' } });
        if (!baseUser) {
            await this.create({
                username: 'user',
                password: this.configService.get<string>('BASE_USER_PASSWORD'),
            });
        }

        const adminUser = await this.userRepository.findOne({ where: { username: 'admin' } });
        if (!adminUser) {
            await this.createAdmin({
                username: 'admin',
                password: this.configService.get<string>('BASE_ADMIN_PASSWORD'),
            });
        }
    }
}