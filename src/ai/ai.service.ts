import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

/**
 * Интерфейс одного сообщения — совпадает с форматом OpenAI/AITunnel.
 * Выносим для удобства, чтобы не тащить типы OpenAI в другие сервисы.
 */
export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.AI_TUNNEL_API_KEY || '',
      baseURL: process.env.AI_TUNNEL_BASE_URL || 'https://api.aitunnel.ru/v1/',
    });

    this.model = process.env.AI_TUNNEL_MODEL || 'deepseek-v4-flash-vision-exp';
  }

  /**
   * Отправляет массив сообщений в нейросеть и возвращает текст ответа.
   *
   * @param messages - массив в формате [{ role, content }, ...]
   * @returns текст ответа от модели
   */
  async chat(messages: AiMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: 4096, // достаточно для ответа на русском языке
      temperature: 0.7, // умеренная креативность
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error('Пустой ответ от нейросети:', response);
      return 'Извините, произошла ошибка. Попробуйте ещё раз.';
    }

    return content;
  }
}
