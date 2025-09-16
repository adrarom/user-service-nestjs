import { Request } from 'express';
import { User } from '../entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}

export * from '../../../auth/interfaces/request-with-user.interface';
