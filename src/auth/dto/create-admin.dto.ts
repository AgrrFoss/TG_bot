import {
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
class AccessDataDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class CreateAdminDto {
  @IsOptional()
  @IsNumber()
  telegramId?: number;

  @IsOptional()
  @IsObject()
  accessData?: AccessDataDto;
}
