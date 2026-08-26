import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

@Global() // доступен во всех модулях без повторного импорта
@Module({
  providers: [
    {
      // Токен, по которому будем получать клиент
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT || 6379),
          password: process.env.REDIS_PASSWORD || undefined,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
