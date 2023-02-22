import { nanoid } from 'nanoid';

import { Role, User } from './types';

export const users: User[] = [
  {
    _id: nanoid(),
    name: 'Arnold',
    email: 'arn@old.com',
    password: '$2b$10$ceuZPxaoqIF7CyoSgHR4IeCNWl9ACin0wXSW5Pth3/IVdVXdkf/Bu', // password
    roles: [Role.user],
  },
  {
    _id: nanoid(),
    name: 'Gertrud',
    email: 'ger@trud.com',
    password: '$2b$10$ceuZPxaoqIF7CyoSgHR4IeCNWl9ACin0wXSW5Pth3/IVdVXdkf/Bu', // password
    roles: [Role.user],
  },
  {
    _id: nanoid(),
    name: 'John',
    email: 'jo@hn.com',
    password: '$2b$10$ceuZPxaoqIF7CyoSgHR4IeCNWl9ACin0wXSW5Pth3/IVdVXdkf/Bu', // password
    roles: [Role.user],
  },
];
