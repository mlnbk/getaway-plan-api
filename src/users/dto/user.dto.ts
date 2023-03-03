import { IsEmail } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../../types';

export class UserDto {
  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @IsEmail()
  @Expose()
  email!: string;

  @ApiProperty()
  @Expose()
  profilePic!: string;

  @ApiProperty({ enum: Role, default: [], isArray: true })
  @Expose()
  roles!: Role[];
}
