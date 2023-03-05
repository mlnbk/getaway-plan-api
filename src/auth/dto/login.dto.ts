import { IsEmail, IsJWT, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsJWT()
  access_token!: string;
}
