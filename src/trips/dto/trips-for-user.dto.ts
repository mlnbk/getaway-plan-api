import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { IsNonPrimitiveArray } from 'src/utils/custom-validator';

import { DestinationDto } from './destination.dto';

export class TripsForUserDto {
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
}
