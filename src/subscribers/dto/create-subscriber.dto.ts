import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsDate,
} from 'class-validator';
export class CreateSubscriberDto {
  @IsOptional()
  @IsString()
  firstName?: string;
  @IsOptional()
  @IsString()
  lastName?: string;
  @IsOptional()
  @IsString()
  username?: string;
  @IsOptional()
  @IsString()
  photoUrl?: string;
  @IsOptional()
  @IsString()
  phoneNumber?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  themes?: string[];
  @IsOptional()
  @IsBoolean()
  isStudent?: boolean;
  @IsOptional()
  @IsString()
  utmSource?: string;
  @IsOptional()
  @IsString()
  utmMedium?: string;
  @IsOptional()
  @IsString()
  utmCampaign?: string;
  @IsOptional()
  @IsDate() // Наше новое поле для паузы ИИ
  aiPausedUntil?: Date;
}
