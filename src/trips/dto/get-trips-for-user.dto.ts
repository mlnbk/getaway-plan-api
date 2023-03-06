import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { IsNonPrimitiveArray } from '../../utils/custom-validator';

import { TripStatus } from '../../types';

import { DestinationDto } from './destination.dto';
import { PaginationDto } from './pagination.dto';

export class GetTripsForUserFiltersDto {
  @ApiProperty()
  @IsOptional()
  @IsMongoId({ each: true })
  invitedUsers?: string[];

  @ApiProperty({ enum: TripStatus, default: [], isArray: true })
  @IsOptional()
  status?: TripStatus[];

  @ApiProperty({ type: [DestinationDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsNonPrimitiveArray()
  @Type(() => DestinationDto)
  destinations?: DestinationDto[];
}
export class GetTripsForUserDto extends PaginationDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => GetTripsForUserFiltersDto)
  filters?: GetTripsForUserFiltersDto;
}
