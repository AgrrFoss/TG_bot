import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { TelegramService } from './telegram/telegram.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const configService = app.get(ConfigService);
  const webhookUrl = process.env.WEBHOOK_URL;

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log('process.env.WEBHOOK_URL in main.ts:', process.env.WEBHOOK_URL);
  if (webhookUrl) {
    const telegramService = app.get(TelegramService);
    await telegramService.setWebhook(webhookUrl);
  } else {
    console.warn(`No webhook URL found for ${webhookUrl}`);
  }
  const url = await app.getUrl();
  console.log(`Server running on port ${url}`);
}
bootstrap();
