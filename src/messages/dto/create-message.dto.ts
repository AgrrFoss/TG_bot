import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
// Создаем типы для валидации через Enum
export type MessageDirection = 'in' | 'out';
export type MessageSenderType = 'client' | 'ai' | 'manager';

export class CreateMessageDto {
  @IsUUID()
  @IsOptional() // Обязательно добавляем, чтобы валидатор не ругался на отсутствие
  subscriberId?: string;
  @IsUUID()
  @IsOptional()
  identityId?: string;
  @IsString()
  platform: string;
  @IsString()
  content: string;
  @IsObject()
  @IsOptional()
  metadata?: any;
  @IsEnum(['in', 'out']) // Ограничиваем только этими двумя значениями
  direction: MessageDirection;
  @IsEnum(['client', 'ai', 'manager']) // Наше новое поле!
  senderType: MessageSenderType;
  @IsString()
  @IsOptional()
  externalId?: string;
  @IsString()
  @IsOptional()
  conversationId?: string;
}
