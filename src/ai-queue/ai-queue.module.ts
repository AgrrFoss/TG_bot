import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiProcessor } from './ai.processor';
import { MessagesModule } from '../messages/messages.module';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai',
    }),
    MessagesModule,
    SubscribersModule,
    TelegrafModule,
    NotificationsModule,
  ],
  providers: [AiProcessor],
  exports: [BullModule],
})
export class AiQueueModule {}
