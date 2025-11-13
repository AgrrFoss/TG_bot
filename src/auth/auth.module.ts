import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
config();
const configService = new ConfigService();
const jwtExpires: string = configService.get('JWT_EXPIRES_IN', '1h');
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: configService.get('JWT_SECRET', 'simple_secret'),
      signOptions: { expiresIn: jwtExpires },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
