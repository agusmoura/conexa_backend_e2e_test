import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import  {AuthDto, ChangePasswordDto } from './dto/auth.dto';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: AuthDto): Promise<any> {
    const payload = { username: user.username};
    const access_token = this.jwtService.sign(payload);
    const expires_in = this.jwtService.decode(access_token, {complete: true})?.payload.exp;
    return {
      access_token,
      expires_in,
      token_type: 'Bearer',
      message: 'Inicio de sesión exitoso',
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<any> {
    const user = await this.usersService.findOneByUsername(changePasswordDto.username);
    const validateUser = user && await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!validateUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    } 

    if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    const updateUser = await this.usersService.update(user.id, {
      username: user.username,
      password: hashedPassword,
    });

    if (!updateUser) {
      throw new InternalServerErrorException('Error al actualizar la contraseña');
    }

   return {
    message: 'Contraseña actualizada exitosamente',
   };
  }

}