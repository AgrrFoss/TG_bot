import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.service';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { SubscribersModule } from '../subscribers/subscribers.module';
config();
const configService = new ConfigService();
const botToken = configService.get<string>('BOT_TOKEN') || '';

@Module({
  imports: [
    SubscribersModule,
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: botToken, // Получаем токен из .env
      }),
    }),
  ],
  providers: [BotUpdate],
})
export class BotModule {}
