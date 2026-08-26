import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  getHello(): string {
    return 'Hello World!';
  }
  async testRedis() {
    // 1. Проверяем, что Redis отвечает
    const ping = await this.redis.ping();
    // 2. Кладём значение в Redis на 60 секунд
    await this.redis.set('hello', 'from nest', 'EX', 60);
    // 3. Читаем его обратно
    const value = await this.redis.get('hello');
    return {
      ping, // должно быть 'PONG'
      value, // должно быть 'from nest'
    };
  }
}
