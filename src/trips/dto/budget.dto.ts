import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class BudgetDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Expose()
  total?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Expose()
  accomodation?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Expose()
  transportation?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Expose()
  food?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Expose()
  activites?: number;
}
