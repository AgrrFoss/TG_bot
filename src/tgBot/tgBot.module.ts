import { Module } from '@nestjs/common';
import { TgBotUpdate } from './tgBot.service';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { MessagesModule } from '../messages/messages.module';
config();

@Module({
  imports: [
    SubscribersModule,
    MessagesModule,
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const tgBotToken = configService.get<string>('TG_BOT_TOKEN');
        const webhookDomain = configService.get<string>('WEBHOOK_URL'); // Ваш публичный домен
        const webhookPath = configService.get<string>('WEBHOOK_PATH', '/bot'); // Путь для вебхука
        const webhookPort = configService.get<number>('PORT', 3000); // Порт, на котором слушает ваше приложение
        const secretToken = configService.get<string>('TELEGRAM_SECRET_TOKEN'); // Опционально, для безопасности
        if (!tgBotToken) {
          throw new Error(
            'TG_BOT_TOKEN is not defined in environment variables',
          );
        }
        if (!webhookDomain && process.env.NODE_ENV === 'production') {
          throw new Error(
            'WEBHOOK_DOMAIN is not defined for production environment',
          );
        }
        return {
          token: tgBotToken,
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
  providers: [TgBotUpdate],
})
export class TgBotModule {}
