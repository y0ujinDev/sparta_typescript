import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePerformanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @IsDate()
  @IsNotEmpty({ message: 'Date and time is required' })
  dateAndTime: Date[];

  @IsNumber()
  @IsNotEmpty({ message: 'VIP Price is required' })
  vipPrice: number;

  @IsNumber()
  @IsNotEmpty({ message: 'S Price is required' })
  rSeatPrice: number;

  @IsNumber()
  @IsNotEmpty({ message: 'R Price is required' })
  sSeatPrice: number;

  @IsString()
  @IsNotEmpty({ message: 'Image is required' })
  image: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;
}
