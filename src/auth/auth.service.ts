import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import  {LoginDto, ChangePasswordDto, LoginResponseDto } from './dto/auth.dto';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}


  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const validateUser = await this.usersService.validateUser(loginDto);
    if (!validateUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { username: loginDto.username };
    const access_token = this.jwtService.sign(payload);
    const expires_in = this.jwtService.decode(access_token, { complete: true })?.payload.exp;

    return {
      access_token,
      token_type: 'Bearer',
      expires_in,
      message: 'Inicio de sesión exitoso'
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