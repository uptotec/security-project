import { ReturnModelType, getModelForClass } from '@typegoose/typegoose';
import UserSchema from './user.schema';

class UserMethods extends UserSchema {
  public static async createUser(
    this: ReturnModelType<typeof UserSchema>,
    name: string,
    phone: string,
    password: string,
    publicKey: string
  ) {
    const user = new this({
      name,
      phone,
      password,
      publicKey,
      pendingMessages: [],
    });

    await user.save();

    return user;
  }

  public static async getUserByPhone(
    this: ReturnModelType<typeof UserSchema>,
    phone: string
  ) {
    const user = this.findOne({ phone }).select('_id name phone publicKey');
    return user;
  }

  public static async getUserById(
    this: ReturnModelType<typeof UserSchema>,
    id: string
  ) {
    return this.findById(id);
  }

  public static async addPendingMessage(
    this: ReturnModelType<typeof UserSchema>,
    id: string,
    message: {
      sender: string;
      message: string;
      nonce: string;
    }
  ) {
    return this.findByIdAndUpdate(id, {
      $push: { pendingMessages: message },
    });
  }

  public static async getAndRemovePendingMessages(
    this: ReturnModelType<typeof UserSchema>,
    id: string
  ) {
    const user = await this.findByIdAndUpdate(id, {
      $set: { pendingMessages: [] },
    }).lean();

    return user!.pendingMessages;
  }
}

const UserModel = getModelForClass(UserMethods, {
  options: { customName: 'users' },
});

export default UserModel;
