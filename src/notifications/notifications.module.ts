import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { NotificationsService } from './notifications.service';
@Module({
  imports: [TelegrafModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
