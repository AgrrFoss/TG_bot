import { IsArray } from 'class-validator';

export class RemoveSeveralDto {
  @IsArray()
  ids: number[];
}
