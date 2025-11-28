import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.service';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { SubscribersModule } from '../subscribers/subscribers.module';
config();
const configService = new ConfigService();
const botToken = configService.get<string>('BOT_TOKEN') || '';

// @Module({
//   imports: [
//     SubscribersModule,
//     TelegrafModule.forRootAsync({
//       useFactory: () => ({
//         token: botToken, // Получаем токен из .env
//       }),
//     }),
//   ],
//   providers: [BotUpdate],
// })
// export class BotModule {}

@Module({
  imports: [
    SubscribersModule,
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const botToken = configService.get<string>('BOT_TOKEN');
        const webhookDomain = configService.get<string>('WEBHOOK_URL'); // Ваш публичный домен
        const webhookPath = configService.get<string>('WEBHOOK_PATH', '/bot'); // Путь для вебхука
        const webhookPort = configService.get<number>('PORT', 3000); // Порт, на котором слушает ваше приложение
        const secretToken = configService.get<string>('TELEGRAM_SECRET_TOKEN'); // Опционально, для безопасности
        if (!botToken) {
          throw new Error('BOT_TOKEN is not defined in environment variables');
        }
        if (!webhookDomain && process.env.NODE_ENV === 'production') {
          throw new Error(
            'WEBHOOK_DOMAIN is not defined for production environment',
          );
        }
        return {
          token: botToken,
          launch: false,
          webhook: webhookDomain
            ? {
                domain: webhookDomain,
                hookPath: webhookPath,
                port: webhookPort,
                secretToken: secretToken,
              }
            : undefined,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [BotUpdate],
})
export class BotModule {}
