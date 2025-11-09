import { IsObject, IsString } from 'class-validator';
import { Subscriber } from '../../subscribers/entities/subscriber.entity';

export class CreateApplicationDto {
  @IsString()
  formName: string;

  @IsObject()
  formData: { name: string; age?: string; phone: string };

  @IsObject()
  userData: Subscriber;
}
