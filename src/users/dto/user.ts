import { z } from 'zod';

export default class userDTO {
  public static createUser = {
    body: z.object({
      name: z.string().min(3).max(40),
      phone: z
        .string()
        .length(11)
        .regex(/^01[0-2,5]{1}[0-9]{8}/),
      password: z
        .string()
        .min(8)
        .max(60)
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,}$/
        ),
      publicKey: z
        .string()
        .length(64)
        .regex(/^[0-9a-fA-F]{64}$/),
    }),
  };

  public static searchUserByPhone = {
    query: z.object({
      phone: z
        .string()
        .length(11)
        .regex(/^01[0-2,5]{1}[0-9]{8}/),
    }),
  };
}
