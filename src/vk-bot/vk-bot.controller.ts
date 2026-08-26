import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express'; // Импортируем типы для Express
import { VK } from 'vk-io';
@Controller('vk')
export class VkBotController {
  constructor(private readonly vk: VK) {}
  @Post()
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // 1. Получаем middleware-функцию от vk-io
    const handle = this.vk.updates.getWebhookCallback();

    // 2. Вызываем её, передавая объекты запроса и ответа Express
    await handle(req, res);
  }
}
