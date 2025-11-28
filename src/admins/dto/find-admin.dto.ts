import {
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindAdminDto {
  @IsOptional()
  @IsNumber()
  telegramId?: number;

  @IsOptional()
  @IsObject()
  accessData?: AccessDataDto;
}
class AccessDataDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
