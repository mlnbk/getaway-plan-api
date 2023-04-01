import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class BudgetDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  total!: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  accomodation?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  transportation?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  food?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  activites?: string;
}
