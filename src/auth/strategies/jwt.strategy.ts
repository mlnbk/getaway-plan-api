import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedUser, JwtPayload } from '../../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    // NOTE: roles live as long as the token, therefore any change in the roles will be in force only after logout/login
    return { _id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
