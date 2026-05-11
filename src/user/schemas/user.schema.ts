import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// 定义 Document 类型，方便在 Service 中进行类型注入
export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true, // 建议加上，会自动生成 createdAt 和 updatedAt
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  nickname: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
