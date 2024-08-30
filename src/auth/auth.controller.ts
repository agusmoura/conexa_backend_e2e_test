import { Controller, Post, Body, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { AuthDto, ChangePasswordDto } from '@/auth/dto/auth.dto';
import { UsersService } from '@/users/users.service';
import { Response as ExpressResponse} from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() body: AuthDto, @Res() res: ExpressResponse): Promise<void> {
    try {
      const userValidated = await this.usersService.validateUser(body);
      const response = await this.authService.login(userValidated);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 400, description: 'Las contraseñas no coinciden' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la contraseña' })
  async changePassword(@Body() body: ChangePasswordDto, @Res() res: ExpressResponse): Promise<void> {
    const response = await this.authService.changePassword(body)
    if (response) {
      res.status(HttpStatus.OK).json(response);
    }
  }
  
}