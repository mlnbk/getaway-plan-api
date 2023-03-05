import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsPositive()
  page?: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  limit?: number;
}
