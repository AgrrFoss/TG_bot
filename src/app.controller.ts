import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post()
  @HttpCode(200)
  confirmationVK() {
    return '1a4b4448';
  }
  @Get('redis-test')
  async redisTest() {
    return this.appService.testRedis();
  }
}
