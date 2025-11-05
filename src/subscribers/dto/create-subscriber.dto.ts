import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNumber()
  telegramId: number;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;
}
