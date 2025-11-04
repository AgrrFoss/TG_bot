import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Response } from 'express'; // Для прямого управления ответом

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any, @Res() res: Response) {
    // Важно: Telegram ожидает 200 OK в ответ на вебхук как можно быстрее.
    // Поэтому сначала отправляем 200, а затем асинхронно обрабатываем обновление.
    res.status(HttpStatus.OK).send('OK');

    // Обрабатываем обновление асинхронно
    await this.telegramService.handleUpdate(update);
  }
}