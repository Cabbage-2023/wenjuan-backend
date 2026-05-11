import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// 1. 定义 Document 类型，方便在 Service 中使用
export type QuestionDocument = HydratedDocument<Question>;

@Schema({
  timestamps: true, // 自动管理 createdAt 和 updatedAt 字段，非常实用
})
export class Question {
  @Prop({ required: true }) // 必填
  title: string;

  @Prop()
  desc: string;

  @Prop({ required: true })
  author: string;

  @Prop({ default: false }) // 默认为 false
  isStar: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  // 如果你有更复杂的字段，比如问卷内容
  @Prop()
  content: string;
}

// 2. 生成真正的 Schema 供 Nest 模块使用
export const QuestionSchema = SchemaFactory.createForClass(Question);
