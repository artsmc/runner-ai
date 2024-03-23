import * as Joi from 'joi';

import { Schema } from 'mongoose';

export let userSchema: Schema = new Schema(
  {
    user: { type: String, index: true, unique: true, required: true },
    offset: { type: Number},
    offsetNumber: { type: Number},
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    strict: true,
    collection: 'users',
  },
);

userSchema.pre<any>('validate', function (next) {
  if (!this.offset) {
    this.offset = 200;
  }
  if (!this.offsetNumber) {
      let randomNumber = Math.floor(Math.random() * (80 - 35 + 1)) + 35;
      this.offsetNumber = randomNumber;
  }
  if (!this.created) {
    this.created = new Date().toISOString();
  }
  if (!this.modified) {
    this.modified = new Date().toISOString();
  }
  next();
});
