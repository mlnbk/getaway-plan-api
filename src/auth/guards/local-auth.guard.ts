import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const loginDto = plainToClass(LoginDto, request.body);
    const errors = await validate(loginDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const canActivate = await super.canActivate(context);
    if (canActivate) {
      return true;
    }
    return request.isAuthenticated();
  }
}
