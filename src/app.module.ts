import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { config } from 'dotenv';
import { join } from 'node:path';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscribersModule } from './subscribers/subscribers.module';
import SnakeNamingStrategy from 'typeorm-naming-strategy';
import { TgBotModule } from './tg-bot/tg-bot.module';
// import { ApplicationsModule } from './applications/applications.module';
import { MessagesModule } from './messages/messages.module';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { VkBotModule } from './vk-bot/vk-bot.module';
import { VkBotController } from './vk-bot/vk-bot.controller';
import { VkBotService } from './vk-bot/vk-bot.service';
import { AiModule } from './ai/ai.module';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bull';
import { AiQueueModule } from './ai-queue/ai-queue.module';

config();
const configService = new ConfigService();
const configParams = {
  isGlobal: true,
  envFilePath: ['.env'],
};
const bullParams = {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

const typeOrmParams: TypeOrmModuleOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USER', 'user'),
  password: configService.get('DB_PASS', '135132'),
  database: configService.get('DB_NAME', 'project_db'),
  entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
  // logging: configService.get('NODE_ENV') !== 'production',
  synchronize: configService.get('NODE_ENV') !== 'production',
  namingStrategy: new SnakeNamingStrategy(),
};

@Module({
  imports: [
    ConfigModule.forRoot(configParams),
    TypeOrmModule.forRoot(typeOrmParams),
    BullModule.forRoot(bullParams),
    SubscribersModule,
    TgBotModule,
    // ApplicationsModule,
    MessagesModule,
    AdminsModule,
    AuthModule,
    VkBotModule,
    AiModule,
    RedisModule,
    AiQueueModule,
  ],
  controllers: [AppController, VkBotController],
  providers: [AppService, VkBotService],
})
export class AppModule {}
