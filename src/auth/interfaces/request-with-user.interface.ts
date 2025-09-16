import { Request } from 'express';
import { User } from '../../controller/user/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}
