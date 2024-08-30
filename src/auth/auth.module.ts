import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { AuthController } from '@/auth/auth.controller';
import { UsersModule } from '@/users/users.module';


@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '60m' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}

