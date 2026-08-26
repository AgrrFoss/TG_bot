import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class NotificationsService {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  /**
   * Отправляет уведомление менеджеру в Telegram-канал.
   */
  async notifyManager(text: string): Promise<void> {
    const chatId = process.env.TELEGRAM_NOTIFICATIONS_CHAT_ID;

    if (!chatId) {
      console.warn(
        'TELEGRAM_NOTIFICATIONS_CHAT_ID не задан. Уведомление не отправлено:',
        text,
      );
      return;
    }

    try {
      await this.bot.telegram.sendMessage(chatId, text);
    } catch (error) {
      console.error('Ошибка отправки уведомления в Telegram:', error);
    }
  }
}
