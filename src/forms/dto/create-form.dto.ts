import { IsNotEmpty } from 'class-validator';
export class CreateFormDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  name: string;
}
