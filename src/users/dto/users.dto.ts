import { IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@/users/users.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'usuario123',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    required: true,
    type: String,
    minimum: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    required: false,
    type: String,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}

export class CreateUserAdminDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'usuario123',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    required: true,
    type: String,
    minimum: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    required: false,
    type: String,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.ADMIN;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'usuario123',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'password123',
        required: true,
        type: String,
        minimum: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({
        description: 'Rol del usuario',
        enum: UserRole,
        required: false,
        type: String,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.USER;
}

