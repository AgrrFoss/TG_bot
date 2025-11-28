import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminsModule } from '../admins/admins.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../admins/entities/admin.entity';
config();
const configService = new ConfigService();
const jwtExpires: string = configService.get('JWT_EXPIRES_IN', '1h');

@Module({
  imports: [
    AdminsModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({
      secret: configService.get('JWT_SECRET', 'simple_secret'),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      signOptions: { expiresIn: jwtExpires },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
