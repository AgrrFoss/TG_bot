import { Module, Global } from '@nestjs/common';
import { VK } from 'vk-io';
import { AiQueueModule } from '../ai-queue/ai-queue.module';

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
  exports: [VK], // Экспортируем класс VK
})
export class VkBotModule {}
