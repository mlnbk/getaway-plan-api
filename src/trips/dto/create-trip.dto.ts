import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Expose, plainToClass, Transform, Type } from 'class-transformer';

import { IsNonPrimitiveArray } from '../../utils/custom-validator';

import { DestinationDto } from './destination.dto';
import { BudgetDto } from './budget.dto';

export class CreateTripDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Expose()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(1)
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
  @Transform((destinations) => {
    return destinations.value.map((destination: any) =>
      plainToClass(DestinationDto, destination),
    );
  })
  @IsNonPrimitiveArray()
  @Type(() => DestinationDto)
  @Expose()
  destinations!: DestinationDto[];

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Transform((budget) => plainToClass(BudgetDto, budget.value))
  @Type(() => BudgetDto)
  @Expose()
  budget?: BudgetDto;
}
