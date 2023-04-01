import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class CountryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Expose()
  name!: string;

  @IsString()
  @Length(2)
  @Expose()
  code!: string;

  @IsOptional()
  @IsUrl()
  @Expose()
  imageUrl?: string;
}
