import { IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class CityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Expose()
  name!: string;

  @IsString()
  @Length(2)
  @Expose()
  countryCode!: string;
}
