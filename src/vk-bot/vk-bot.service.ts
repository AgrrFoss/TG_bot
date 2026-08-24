import { Injectable, OnModuleInit } from '@nestjs/common';
import { VK, MessageContext } from 'vk-io';
import { CreateSubscriberDto } from '../subscribers/dto/create-subscriber.dto';
import { SubscribersService } from '../subscribers/subscribers.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class VkBotService implements OnModuleInit {
  // Nest автоматически сопоставит тип VK с провайдером из VkModule
  constructor(
    private readonly vk: VK,
    private readonly subscribersService: SubscribersService,
    private readonly messagesService: MessagesService,
  ) {}

  onModuleInit() {
    this.vk.updates.on('message_new', this.handleNewMessage.bind(this));
    this.vk.updates.on('message_reply', this.handleReplyMessage.bind(this));
  }

  private async handleNewMessage(context: MessageContext) {
    if (context.senderType !== 'user' || context.senderId < 0) {
      return;
    }
    try {
      // Проверяем наличие этого подписчика в базе, и если его нет, создаем его.
      const platformId = String(context.senderId);
      const [vkUser] = await this.vk.api.users.get({
        user_ids: [context.senderId],
        fields: ['photo_200', 'screen_name'],
      });
      const subscriberDto: CreateSubscriberDto = {
        firstName: vkUser?.first_name,
        lastName: vkUser?.last_name,
        username: vkUser?.screen_name,
        photoUrl: vkUser?.photo_200,
      };
      const { subscriber, identity } =
        await this.subscribersService.findOrCreate(
          'vk',
          platformId,
          subscriberDto,
        );
      await this.messagesService.create({
        content: context.text || '',
        platform: 'vk',
        direction: 'in',
        senderType: 'client',
        identityId: identity.id,
        subscriberId: subscriber.id,
        externalId: String(context.id),
        conversationId: context.conversationMessageId
          ? String(context.conversationMessageId)
          : undefined,
        metadata: {
          attachments: context.attachments,
          vkCreatedAt: context.createdAt,
          peerId: context.peerId,
          senderId: context.senderId,
        },
      });
      console.log(
        `Сообщение от ${subscriber.firstName || 'нового пользователя'} сохранено`,
      );
      // await context.send(
      //   'Привет! Бот на связи и я сохранил твое сообщение в базу.',
      // );
    } catch (error) {
      console.error('Ошибка при обработке входящего сообщения ВК:', error);
    }
  }

  private async handleReplyMessage(context: MessageContext) {
    try {
      const platformId = String(context.peerId);
      const found = await this.subscribersService.findByPlatform(
        'vk',
        platformId,
      );
      if (!found) {
        console.warn('Получатель исходящего не найден:', platformId);
        return;
      }
      const isBot = context.senderType === 'group'; // отрицательный from_id
      const isManager = context.senderType === 'user'; // положительный from_id + admin_author_id
      const senderType: 'ai' | 'manager' = isBot ? 'ai' : 'manager';
      await this.messagesService.create({
        content: context.text || '',
        platform: 'vk',
        direction: 'out',
        senderType,
        identityId: found.identity.id,
        subscriberId: found.subscriber.id,
        externalId: String(context.id),
        conversationId: context.conversationMessageId
          ? String(context.conversationMessageId)
          : undefined,
        metadata: {
          vkCreatedAt: context.createdAt,
          peerId: context.peerId,
          senderId: context.senderId,
          isBot,
        },
      });
      if (isManager) {
        await this.subscribersService.updateAiPause(found.subscriber.id, 15);
        console.log(`Менеджер ответил → ИИ заглушен на 15 мин.`);
      } else {
        console.log(`Бот ответил → таймер не трогаем.`);
      }
    } catch (error) {
      console.error('Ошибка при обработке исходящего ВК:', error);
    }
  }
}
