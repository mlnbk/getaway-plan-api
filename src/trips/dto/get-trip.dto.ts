import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class GetTripRequestDto {
  @ApiProperty()
  @IsMongoId()
  @Type(() => String)
  @Expose()
  tripId!: string;
}
