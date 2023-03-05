import { Request } from 'express';
import { UserDocument } from './users/schema/user.schema';

export type AuthenticatedUser = {
  _id: string;
  email: string;
  roles: Role[];
};

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export type JwtPayload = {
  sub: string;
  email: string;
  roles: Role[];
};

export type RequestWithUser = Request & { user: UserDocument };

export enum Role {
  admin = 'admin',
  user = 'user',
}

export enum TripStatus {
  past = 'past',
  current = 'current',
  upcoming = 'upcoming',
}
