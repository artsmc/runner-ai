import * as _ from 'lodash';
const options = {
  minPoolSize: 2,
  useNewUrlParser: "true",
  useUnifiedTopology: "true"
};
export const MONGODB_CONNECTION = process.env.MONGO_DEV;
export const mongoSetup = {
  options,
  MONGODB_CONNECTION
};
