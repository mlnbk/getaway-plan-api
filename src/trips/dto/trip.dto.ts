import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsMongoId } from 'class-validator';

import { CreateTripDto } from './create-trip.dto';

export class TripDto extends CreateTripDto {
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
