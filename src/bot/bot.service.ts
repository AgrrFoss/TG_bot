import { Update, Start, Ctx } from 'nestjs-telegraf';
import { SubscribersService } from '../subscribers/subscribers.service';
import { Context } from 'telegraf';
import parseStartParams from '../utilites/parseStartParams';

@Update()
export class BotUpdate {
  constructor(private readonly subscribersService: SubscribersService) {}
  @Start()
  async onStart(@Ctx() ctx: Context) {
    // Проверяем, что у нас есть информация о пользователе
    const user = ctx.from;
    if (!user) {
      return ctx.reply('Не удалось получить информацию о пользователе.');
    }
    const text = ctx.text;
    const pattern = /usr=|umd=|ucm=/;
    const includeUtm = text ? pattern.test(text) : false;
    const utmTerms = {
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    };
    if (text && includeUtm) {
      const params = text?.split(' ');
      const parsedUtmTerms = parseStartParams(params[1]);
      utmTerms.utmSource = parsedUtmTerms.usr || '';
      utmTerms.utmMedium = parsedUtmTerms.umd || '';
      utmTerms.utmCampaign = parsedUtmTerms.ucm || '';
    }
    const newSubscriber = {
      tgId: user.id,
      firstName: user.first_name || 'Неизвестно',
      lastName: user.last_name || 'Неизвестно',
      username: user.username || undefined,
      utmSource: utmTerms.utmSource,
      utmMedium: utmTerms.utmMedium,
      utmCampaign: utmTerms.utmCampaign,
    };
    try {
      const subscriber =
        await this.subscribersService.createOrUpdate(newSubscriber);
      console.log(`Subscriber saved/updated: ${JSON.stringify(subscriber)}`);
      // Отправляем приветственное сообщение
      await ctx.reply(
        `Привет, ${newSubscriber.firstName}! Спасибо за подписку. Будем на связи!`,
      );
    } catch (error) {
      console.error('Ошибка при сохранении подписчика:', error);
      await ctx.reply(
        'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.',
      );
    }
  }
}
