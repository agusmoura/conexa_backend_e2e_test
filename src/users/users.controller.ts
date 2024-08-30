import { Controller, HttpStatus, Get, Post, Delete, Put, Body, Param, UseGuards, Res } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { CreateUserDto, UpdateUserDto } from '@/users/dto/users.dto';
import { Roles } from '@/users/roles.decorator';
import { UserRole } from '@/users/users.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/users/roles.guard';
import { User } from '@/users/users.entity';
import { Response as ExpressResponse} from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    @ApiResponse({ status: 400, description: 'El usuario ya existe' })
    async create(@Body() createUserDto: CreateUserDto, @Res() res: ExpressResponse): Promise<Object> {
        const userCreated = await this.userService.create(createUserDto);
        return res.status(HttpStatus.CREATED).json(userCreated);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener todos los usuarios - (ADMIN)' })
    @ApiResponse({ status: 200, description: 'Usuarios obtenidos exitosamente', type: [User] })
    async findAll(@Res() res: ExpressResponse): Promise<Object> {
        const users = await this.userService.findAll();
        return res.status(HttpStatus.OK).json(users);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar un usuario - (ADMIN)' })
    @ApiBody({ type: UpdateUserDto })
    @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente', type: User })
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @Res() res: ExpressResponse): Promise<Object> {
        const userUpdated = await this.userService.update(id, updateUserDto);
        return res.status(HttpStatus.OK).json(userUpdated);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar un usuario - (ADMIN)' })
    @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })  
    async remove(@Param('id') id: number, @Res() res: ExpressResponse): Promise<void> {
        const result = await this.userService.remove(id);
        res.status(HttpStatus.OK).json(result);
    }
}



