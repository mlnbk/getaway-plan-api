import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class DeleteTripRequestDto {
  @ApiProperty()
  @IsMongoId()
  @Type(() => String)
  @Expose()
  tripId!: string;
}

export class DeleteTripResponseDto {
  @ApiProperty()
  @IsBoolean()
  @Expose()
  ok?: boolean;
}
