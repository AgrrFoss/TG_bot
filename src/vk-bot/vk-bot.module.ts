import { Module, Global } from '@nestjs/common';
import { VK } from 'vk-io';
import { AiQueueModule } from '../ai-queue/ai-queue.module';
import { VkBotController } from './vk-bot.controller';

@Global()
@Module({
  imports: [AiQueueModule],
  providers: [
    {
      // Используем сам класс VK как токен!
      provide: VK,
      useFactory: () => {
        return new VK({
          token: process.env.VK_BOT_TOKEN || '',
          webhookSecret: process.env.VK_SECRET,
          webhookConfirmation: process.env.VK_CONFIRMATION,
        });
      },
    },
  ],
  controllers: [VkBotController],
  exports: [VK], // Экспортируем класс VK
})
export class VkBotModule {}
