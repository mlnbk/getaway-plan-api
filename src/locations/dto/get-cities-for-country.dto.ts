import { IsString, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class GetCitiesForCountryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Expose()
  country!: string;
}
