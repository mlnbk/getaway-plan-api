import { IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class GetCitiesForCountryDto {
  @IsString()
  @Length(2)
  @Expose()
  countryCode!: string;
}
