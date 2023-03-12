import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';

import { CreateTripDto } from './create-trip.dto';

export class TripDto extends CreateTripDto {
  @ApiProperty()
  @IsOptional()
  @IsArray()
  @Expose()
  pictures?: string[];

  @ApiProperty()
  @IsMongoId()
  @Expose()
  @Type(() => String)
  user!: string;

  @ApiProperty()
  @IsMongoId()
  @Expose()
  @Type(() => String)
  _id!: string;
}
