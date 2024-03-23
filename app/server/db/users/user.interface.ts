import { Document } from 'mongoose';

export interface IUser extends Document {
  _id?: string;
  user:string;
  offset: number;
  oofsetNumber: number;
  created: Date;
  modified: Date;
}

