import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

import { CreateTripDto } from './create-trip.dto';

export class TripDto extends CreateTripDto {
  @ApiProperty()
  @IsMongoId()
  user!: string;
}
