import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { IsNonPrimitiveArray } from '../../utils/custom-validator';

import { TripStatus } from '../../types';

import { DestinationDto } from './destination.dto';

export class GetTripsForUserDto {
  @ApiProperty()
  @IsOptional()
  @IsMongoId({ each: true })
  invitedUsers?: string[];

  @ApiProperty()
  @IsOptional()
  status?: TripStatus[];

  @ApiProperty({ type: [DestinationDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsNonPrimitiveArray()
  @Type(() => DestinationDto)
  destinations?: DestinationDto[];
}
