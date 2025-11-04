import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { config } from 'dotenv';
import { join } from 'node:path';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscribersModule } from './subscribers/subscribers.module';
import { TelegramModule } from './telegram/telegram.module';
import SnakeNamingStrategy from 'typeorm-naming-strategy';

config();
const configService = new ConfigService();
const configParams = {
  isGlobal: true,
  envFilePath: ['.env'],
};

const typeOrmParams: TypeOrmModuleOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USER', 'user'),
  password: configService.get('DB_PASS', '135132'),
  database: configService.get('DB_NAME', 'project_db'),
  entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};

@Module({
  imports: [
    ConfigModule.forRoot(configParams),
    TypeOrmModule.forRoot(typeOrmParams),
    SubscribersModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
