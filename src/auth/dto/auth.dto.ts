import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
    @ApiProperty({
        description: 'Nombre de usuario',
        example: 'usuario123',
        required: true,
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    username: string;
               
    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'password123',
        required: true,
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}


export class ChangePasswordDto {
    @ApiProperty({
        description: 'Nombre de usuario',
        example: 'usuario123',
        required: true,
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({
        description: 'Contraseña actual del usuario',
        example: 'password123',
        required: true,
        type: String,
        minimum: 8,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    oldPassword: string;

    @ApiProperty({
        description: 'Contraseña nueva del usuario',
        example: 'password123',
        required: true,
        type: String,
        minimum: 8,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    newPassword: string;

    @ApiProperty({
        description: 'Confirmación de la contraseña nueva',
        example: 'password123',
        required: true,
        type: String,
        minimum: 8,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    confirmNewPassword: string;
}


export interface JwtPayload {
    username: string;
}

