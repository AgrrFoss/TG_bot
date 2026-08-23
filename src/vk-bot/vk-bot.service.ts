import { Injectable, OnModuleInit } from '@nestjs/common';
import { VK, MessageContext } from 'vk-io';
import { CreateSubscriberDto } from '../subscribers/dto/create-subscriber.dto';
import { SubscribersService } from '../subscribers/subscribers.service';
@Injectable()
export class VkBotService implements OnModuleInit {
  // Nest автоматически сопоставит тип VK с провайдером из VkModule
  constructor(
    private readonly vk: VK,
    private readonly subscribersService: SubscribersService,
  ) {}
  onModuleInit() {
    this.vk.updates.on('message_new', this.handleNewMessage.bind(this));
    this.vk.updates.on('message_reply', this.handleReplyMessage.bind(this));
  }
  private async handleNewMessage(context: MessageContext) {
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
    // const { subscriber, identity } = await this.subscribersService.findOrCreate(
    await this.subscribersService.findOrCreate('vk', platformId, subscriberDto);
  }

  private async handleReplyMessage(context: MessageContext) {
    if (context.text?.toLowerCase() === 'привет') {
      await context.send('Привет! Бот на связи.');
    }
  }
}
