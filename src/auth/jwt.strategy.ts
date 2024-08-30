import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from '@/auth/dto/auth.dto';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
       readonly configService: ConfigService, 
       private readonly usersService: UsersService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET'),
      });
    }
  
    async validate(payload: JwtPayload) {
      const user = await this.usersService.findOneByUsername(payload.username);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      return { userId: user.id, username: user.username, role: user.role }; 
    }

}
