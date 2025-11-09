import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriberDto } from './create-subscriber.dto';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriberDto extends PartialType(CreateSubscriberDto) {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsArray()
  themes?: string[];

  @IsOptional()
  @IsBoolean()
  isStudent?: boolean;

  @IsOptional()
  @IsBoolean()
  unsubscribed?: boolean;
}
