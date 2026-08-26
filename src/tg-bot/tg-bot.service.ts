import { Injectable } from '@nestjs/common';
import { Update, Start, Ctx, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
// import parseStartParams from '../utilites/parseStartParams';
import { SubscribersService } from '../subscribers/subscribers.service';
import { MessagesService } from '../messages/messages.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
@Injectable()
@Update()
export class TgBotService {
  constructor(
    private readonly subscribersService: SubscribersService,
    private readonly messagesService: MessagesService,
    @InjectQueue('ai') private readonly aiQueue: Queue,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const user = ctx.from;
    if (!user) return;
    const platformId = String(user.id);
    // Парсим deep-link параметры
    const startPayload = (ctx.message as any)?.text?.split(' ')?.[1];
    // TODO: распарсить UTM из startPayload, если нужно
    // Находим или создаём подписчика
    const { subscriber } = await this.subscribersService.findOrCreate(
      'telegram',
      platformId,
      {
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: undefined, // телеграм не даёт photoUrl напрямую
      },
    );
    console.log(
      `TG: команда /start от ${subscriber.firstName || platformId}. UTM: ${startPayload || 'нет'}`,
    );
    // Ответа пока не шлём — AI сам ответит на первое сообщение
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const msg = ctx.message as any;
    if (!msg || !msg.text) return;
    const user = ctx.from;
    if (!user) return;

    const text = msg.text;
    // Пропускаем команды (начинаются с /)
    if (text.startsWith('/')) return;

    const platformId = String(user.id);
    const chatId = msg.chat?.id;
    try {
      // 1. Находим или создаём подписчика
      const { subscriber, identity } =
        await this.subscribersService.findOrCreate('telegram', platformId, {
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          photoUrl: undefined,
        });
      // 2. Сохраняем входящее сообщение
      await this.messagesService.create({
        content: text,
        platform: 'telegram',
        direction: 'in',
        senderType: 'client',
        identityId: identity.id,
        subscriberId: subscriber.id,
        externalId: String(msg.message_id),
        conversationId: String(msg.chat?.id),
        metadata: {
          chatId: msg.chat?.id,
          fromId: user.id,
        },
      });
      console.log(
        `TG: сообщение от ${subscriber.firstName || platformId} сохранено`,
      );
      // 3. Проверяем таймер тишины ИИ
      const now = new Date();
      if (subscriber.aiPausedUntil && subscriber.aiPausedUntil > now) {
        console.log(`TG: ИИ заглушен для ${subscriber.firstName}`);
        return;
      }
      // 4. Кладём задачу в AI-очередь
      await this.aiQueue.add('process-message', {
        subscriberId: subscriber.id,
        peerId: chatId,
        platform: 'telegram',
      });
      console.log(`TG: задача для ИИ была бы добавлена для ${subscriber.id}`);
    } catch (error) {
      console.error('TG: ошибка при обработке сообщения:', error);
    }
  }

  // @Start()
  // async onStart(@Ctx() ctx: Context) {
  //   // Проверяем, что у нас есть информация о пользователе
  //   console.log('Что-то стартовало', ctx);
  //   const user = ctx.from;
  //   if (!user) {
  //     return ctx.reply('Не удалось получить информацию о пользователе.');
  //   }
  //   const text = ctx.text;
  //   const pattern = /usr=|umd=|ucm=/;
  //   const includeUtm = text ? pattern.test(text) : false;
  //   const utmTerms = {
  //     utmSource: '',
  //     utmMedium: '',
  //     utmCampaign: '',
  //   };
  //   if (text && includeUtm) {
  //     const params = text?.split(' ');
  //     const parsedUtmTerms = parseStartParams(params[1]);
  //     utmTerms.utmSource = parsedUtmTerms.usr || '';
  //     utmTerms.utmMedium = parsedUtmTerms.umd || '';
  //     utmTerms.utmCampaign = parsedUtmTerms.ucm || '';
  //   }
  //   const newSubscriber = {
  //     tgId: user.id,
  //     firstName: user.first_name || 'Неизвестно',
  //     lastName: user.last_name || 'Неизвестно',
  //     username: user.username || undefined,
  //     utmSource: utmTerms.utmSource,
  //     utmMedium: utmTerms.utmMedium,
  //     utmCampaign: utmTerms.utmCampaign,
  //   };
  //   try {
  //     const subscriber =
  //       await this.subscribersService.createOrUpdate(newSubscriber);
  //     console.log(`Subscriber saved/updated: ${JSON.stringify(subscriber)}`);
  //     // Отправляем приветственное сообщение
  //     await ctx.reply(
  //       `Привет, ${newSubscriber.firstName}! Спасибо за подписку. Будем на связи!`,
  //     );
  //   } catch (error) {
  //     console.error('Ошибка при сохранении подписчика:', error);
  //     await ctx.reply(
  //       'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.',
  //     );
  //   }
  // }
}
