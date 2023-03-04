import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IsNonPrimitiveArray } from '../../utils/custom-validator';

import { DestinationDto } from './destination.dto';
import { BudgetDto } from './budget.dto';

export class CreateTripDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsMongoId({ each: true })
  invitedUsers?: string[];

  @ApiProperty()
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty({ type: [DestinationDto] })
  @ValidateNested({ each: true })
  @IsNonPrimitiveArray()
  @Type(() => DestinationDto)
  destinations!: DestinationDto[];

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetDto)
  budget?: BudgetDto;
}
