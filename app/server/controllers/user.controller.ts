import { UserModel } from "../db/users/user.model";

class UserController {
  constructor() { }

  public async getUser(id: string) {
    const user = await UserModel.findOne({ user: id }).catch((err) => err);
    if (!user || user instanceof Error) {
      return { msg: 'User not found or there was an error' }
    }
    return user;
  }

  public async createUser(user: { offset: number, user: string }) {
    const newUser = new UserModel(user);
    const result = await newUser.save().catch((err) => err);
    if (result instanceof Error) {
      return { msg: 'Error creating user' };
    }
    return result;
  }
  public async modifyUserOffset(user: { offset: number, user: string }) {
    try {
      const updatedUser = await UserModel.findOneAndUpdate({ user: user.user }, { offset: user.offset, modified: new Date().toISOString() }, { new: true });
      if (!updatedUser) {
        return { msg: 'User not found' };
      }
      return updatedUser;
    } catch (err) {
      return { msg: 'Error updating user', error: err };
    }
  }
  public async modifyUserModifiedDate(user: string) {
    console.log({user})
    try {
      const updatedUser = await UserModel.findOneAndUpdate({ user: user }, { modified: new Date().toISOString() }, { new: true });
      if (!updatedUser) {
        return { msg: 'User not found' };
      }
      return updatedUser;
    } catch (err) {
      return { msg: 'Error updating user', error: err };
    }
  }
  public async getAllUsersInTheLast2Hours() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const recentUsers = await UserModel.find({ modified: { $gte: twoHoursAgo } }).catch((err) => err);
    if (recentUsers instanceof Error) {
      return { msg: 'Error retrieving users' };
    }
    return recentUsers;
  }




}

export const userController = new UserController();