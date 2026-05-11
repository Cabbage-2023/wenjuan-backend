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

  @Prop()
  js: string;

  @Prop()
  css: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false }) // 默认为 false
  isStar: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: true })
  author: string;

  @Prop()
  componentList: {
    fe_id: string; //组件fe_id，需要前端控制，由前端生成
    type: string;
    title: string;
    isHidden: boolean;
    isLocked: boolean;
    props: object; //组件属性
  }[];
}

// 2. 生成真正的 Schema 供 Nest 模块使用
export const QuestionSchema = SchemaFactory.createForClass(Question);
