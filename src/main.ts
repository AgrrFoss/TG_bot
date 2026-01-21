import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const configService = app.get(ConfigService);
  // app.use(cookieParser(configService.get('')));
  app.use(cookieParser('sldfkjsldifjlk'));
  app.enableCors({
    origin: 'https://heartlessly-mindful-gunnel.cloudpub.ru',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  const url = await app.getUrl();
  console.log(`Server running on port ${url}`);
}
bootstrap();
