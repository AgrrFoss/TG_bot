import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscribersService } from '../subscribers/subscribers.service';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly botToken: string;
  private readonly telegramApiUrl: string;
  private readonly logger = new Logger(TelegramService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriberService: SubscribersService,
  ) {
    this.botToken = this.configService.get<string>('BOT_TOKEN') || '';
    this.telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessage(chatId: number, text: string): Promise<any> {
    console.log(' получаемый айдишник чата', chatId);
    try {
      const response = await axios.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
      });
      return response;
    } catch (error: any) {
      this.logger.error(
        'Failed to send message:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  async setWebhook (url: string): Promise<any> {
    try {
      const response = await axios.post(`${this.telegramApiUrl}/setWebhook`, {
        url,
      });
      this.logger.log(
        `Webhook set to: ${url}. Result: ${JSON.stringify(response.data)}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to set webhook:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async handleUpdate(update: any) {
    this.logger.log('Received Telegram update:', JSON.stringify(update));
    console.log(update);

    if (update.message) {
      const { chat, from, text } = update.message;
      const chatId = chat.id;

      if (text === '/start') {
        // Сохраняем или обновляем подписчика
        const subscriber = await this.subscriberService.createOrUpdate(
          from.id,
          from.first_name,
          from.last_name,
          from.username,
        );
        this.logger.log(`Subscriber saved/updated: ${JSON.stringify(subscriber)}`);

        await this.sendMessage(chatId, `Привет, ${from.first_name}! Ты успешно подписан.`);
      } else {
        await this.sendMessage(chatId, `Я получил твое сообщение: "${text}". Пока я умею только приветствовать по команде /start.`);
      }
    }
    // Здесь можно добавить обработку других типов обновлений: callback_query, inline_query и т.д.
  }
}
