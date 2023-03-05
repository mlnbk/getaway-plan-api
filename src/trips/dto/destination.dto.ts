import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class DestinationDto {
  @ApiProperty()
  @IsString()
  @Expose()
  country!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  address?: string;
}
