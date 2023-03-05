import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { IsNonPrimitiveArray } from '../../utils/custom-validator';

import { DestinationDto } from './destination.dto';
import { BudgetDto } from './budget.dto';

export class CreateTripDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsMongoId({ each: true })
  @Expose()
  @Type(() => String)
  invitedUsers?: string[];

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  @Expose()
  startDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  @Expose()
  endDate?: Date;

  @ApiProperty({ type: [DestinationDto] })
  @ValidateNested({ each: true })
  @IsNonPrimitiveArray()
  @Type(() => DestinationDto)
  @Expose()
  destinations!: DestinationDto[];

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetDto)
  @Expose()
  budget?: BudgetDto;
}
