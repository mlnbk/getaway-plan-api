import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class BudgetDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  accomodation?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  transportation?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  food?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  activites?: number;
}
