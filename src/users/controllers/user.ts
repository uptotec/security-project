import { Request, Response } from 'express';
import userDTO from '../dto/user';
import userService from '../services/user';
import jwt from 'jsonwebtoken';

export default class userController {
  public static async createUser(req: Request, res: Response) {
    const verifiedBody = userDTO.createUser.body.safeParse(req.body);
    if (!verifiedBody.success) {
      return res.status(400).json({
        message: 'Invalid body',
        errors: verifiedBody.error.errors,
      });
    }

    const { name, phone, password, publicKey } = verifiedBody.data;

    const payload = await userService.createUser(
      name,
      phone,
      password,
      publicKey
    );

    return res.status(201).json(payload);
  }

  static async verifyJwtToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  public static async searchUserByPhone(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = await userController.verifyJwtToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const verifiedQuery = userDTO.searchUserByPhone.query.safeParse(req.query);
    if (!verifiedQuery.success) {
      return res.status(400).json({
        message: 'Invalid query',
        errors: verifiedQuery.error.errors,
      });
    }

    const { phone } = verifiedQuery.data;

    const user = await userService.searchUserByPhone(phone);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  }
}
