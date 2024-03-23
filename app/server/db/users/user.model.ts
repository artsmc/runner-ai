
import * as mongoose from 'mongoose';
import { mongoSetup } from '../config';
import { IUser } from './user.interface';
import { userSchema } from './user.schema';

mongoose.connect(mongoSetup.MONGODB_CONNECTION, mongoSetup.options);
export const UserModel: mongoose.Model<IUser> = mongoose.model<IUser>(
  'Users',
  userSchema,
);
