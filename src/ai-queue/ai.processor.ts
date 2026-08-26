import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { VK } from 'vk-io';
import { AiService, AiMessage } from '../ai/ai.service';
import { MessagesService } from '../messages/messages.service';
import { parseAiResponse } from '../ai/parse-ai-response';
import { AiAction } from '../ai/ai-actions';
import { SubscribersService } from '../subscribers/subscribers.service';
import { buildSystemPrompt } from '../ai/build-system-prompt';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { NotificationsService } from '../notifications/notifications.service';

export interface AiJobData {
  subscriberId: string;
  peerId: number;
  platform: 'vk' | 'telegram';
}

@Processor('ai')
export class AiProcessor {
  constructor(
    private readonly vk: VK,
    private readonly messagesService: MessagesService,
    private readonly subscribersService: SubscribersService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
    @InjectBot() private readonly tg: Telegraf,
  ) {}
  @Process('process-message') // тип задачи
  async processMessage(job: Job<AiJobData>): Promise<string> {
    const { subscriberId, peerId, platform } = job.data;
    // 1. Собираем историю из БД
    const history = await this.messagesService.getHistoryForAi(
      subscriberId,
      20,
    );
    // 2. Формируем сообщения для нейросети
    const messages: AiMessage[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
    ];
    // 3. Получаем ответ от DeepSeek через AITunnel
    const rawAnswer = await this.aiService.chat(messages);
    const { text, action } = parseAiResponse(rawAnswer);
    // 4. Отправляем ответ пользователю в VK
    if (platform === 'vk') {
      await this.vk.api.messages.send({
        peer_id: peerId,
        message: text || 'Извините, произошла ошибка. Попробуйте ещё раз.',
        random_id: Math.floor(Math.random() * 1_000_000_000),
      });
    } else if (platform === 'telegram') {
      await this.tg.telegram.sendMessage(
        peerId,
        text || 'Извините, произошла ошибка. Попробуйте ещё раз.',
      );
    }
    console.log('Actions: ', action);

    // 6. Выполняем действие
    const subscriber = await this.subscribersService.findById(subscriberId);
    const username = await this.subscribersService.getUsernameForPlatform(
      subscriberId,
      platform,
    );
    if (action === AiAction.NEED_MANAGER) {
      await this.subscribersService.updateAiPause(subscriberId, 15);
      const lastUserMessage = history
        .filter((h) => h.role === 'user')
        .pop()?.content;
      await this.notificationsService.notifyManager(
        [
          '⚠️ Требуется менеджер',
          '',
          `Платформа: ${platform}`,
          `Клиент: ${subscriber?.firstName || '—'} ${subscriber?.lastName || ''}`.trim(),
          `Username (${platform}): ${username}`,
          `Последнее сообщение: ${lastUserMessage || '—'}`,
        ].join('\n'),
      );
      console.warn(
        `[ACTION] Клиент просит человека. Уведомление отправлено. subscriberId=${subscriberId}`,
      );
    }
    if (action === AiAction.NEW_APPLICATION) {
      const lastUserMessage = history
        .filter((h) => h.role === 'user')
        .pop()?.content;
      await this.notificationsService.notifyManager(
        [
          '🎉 Новая заявка на пробное занятие',
          '',
          `Платформа: ${platform}`,
          `Клиент: ${subscriber?.firstName || '—'} ${subscriber?.lastName || ''}`.trim(),
          `Username (${platform}): ${username}`,
          `Телефон: ${subscriber?.phoneNumber || 'не указан'}`,
          `Последнее сообщение: ${lastUserMessage || '—'}`,
        ].join('\n'),
      );
      console.warn(
        `[ACTION] Новая заявка. Уведомление отправлено. subscriberId=${subscriberId}`,
      );
    }
    console.log(
      `AI ответил через ${platform}, peerId=${peerId}, action=${action}`,
    );
    return text;
  }
}
