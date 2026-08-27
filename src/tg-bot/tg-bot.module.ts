import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { MessagesModule } from '../messages/messages.module';
import { TgBotService } from './tg-bot.service';
import { AiQueueModule } from '../ai-queue/ai-queue.module';
// @ts-ignore
import { SocksProxyAgent } from 'socks-proxy-agent';

@Module({
  imports: [
    SubscribersModule,
    MessagesModule,
    AiQueueModule,
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TG_BOT_TOKEN');
        const proxyUrl = configService.get<string>('TELEGRAM_PROXY');
        // const domain = configService.get<string>('WEBHOOK_URL');
        // const path = configService.get<string>('WEBHOOK_PATH', '/tg-webhook');
        // const port = configService.get<number>('PORT', 5678);
        // const secret = configService.get<string>('TELEGRAM_SECRET_TOKEN');
        if (!token) {
          console.warn('TG_BOT_TOKEN не задан — Telegram-бот отключён');
          return { token: '' };
        }
        console.log('TELEGRAM_PROXY =', proxyUrl || 'НЕ ЗАДАН');
        const agent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;
        return {
          token,
          launchOptions: {
            dropPendingUpdates: true, // не обрабатываем сообщения, пришедшие пока бот был офлайн
          },
          options: {
            telegram: agent ? { agent } : undefined,
          },
          // В разработке webhook может быть не настроен — тогда polling
          // ...(domain
          //   ? {
          //       webhook: {
          //         domain,
          //         hookPath: path,
          //         port,
          //         secretToken: secret,
          //       },
          //     }
          //   : {}),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TgBotService],
})
export class TgBotModule {}
