import UserModel from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default class userService {
  public static async createUser(
    name: string,
    phone: string,
    password: string,
    publicKey: string
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.createUser(
      name,
      phone,
      hashedPassword,
      publicKey
    );

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '9999y',
    });

    return { userId: user._id, token };
  }

  public static async searchUserByPhone(phone: string) {
    return await UserModel.getUserByPhone(phone);
  }

  public static async getUserById(id: string) {
    return await UserModel.getUserById(id);
  }

  public static async addPendingMessage(
    id: string,
    message: {
      sender: string;
      message: string;
      nonce: string;
    }
  ) {
    return await UserModel.addPendingMessage(id, message);
  }

  public static async getAndRemovePendingMessages(id: string) {
    return await UserModel.getAndRemovePendingMessages(id);
  }
}
