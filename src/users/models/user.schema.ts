import { Prop, Severity, modelOptions } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Message {
  sender: string;
  message: string;
  nonce: string;
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class UserSchema extends TimeStamps {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  pendingMessages: Message[];
}
