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

export enum Role {
  admin = 'admin',
  user = 'user',
}

export type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  roles: Role[];
};
