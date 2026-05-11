import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';

import { Question } from './schemas/question.schema';

@Injectable()
export class QuestionService {
  constructor(
    // 从 Nest 模块中注入 Question 模型
    @InjectModel(Question.name)
    private readonly questionModel,
  ) {}

  async create(username: string) {
    const question = new this.questionModel({
      title: '问卷标题' + Date.now(),
      desc: '问卷描述',
      author: username,
      componentList: [
        {
          fe_id: nanoid(),
          type: 'questionInfo',
          title: '问卷信息',
          props: {
            title: '问卷标题',
            desc: '问卷描述',
          },
        },
      ],
    });
    return await question.save();
  }

  async delete(id: string, author: string) {
    const res = await this.questionModel.findOneAndDelete({
      _id: id,
      author,
    });
    return res;
  }

  async deleteMany(author: string, ids: string[]) {
    const res = await this.questionModel.deleteMany({
      _id: { $in: ids },
      author,
    });
    return res;
  }

  async update(id: string, updateData, author) {
    return await this.questionModel.updateOne({ _id: id, author }, updateData);
  }

  async findOne(id: string) {
    return await this.questionModel.findById(id);
  }

  async findAllList({ keyword = '', page = 1, pageSize = 10, isDeleted = false, isStar, author = '' }) {
    // 1. 统一转换布尔值（保险起见）
    const isDeletedBool = String(isDeleted) === 'true';

    const whereOpt: any = {
      author,
      isDeleted: isDeletedBool,
    };

    // 2. ✅ 同步 countAll 的逻辑：回收站模式下忽略星标过滤
    if (isDeletedBool === false && isStar != null) {
      whereOpt.isStar = String(isStar) === 'true';
    }

    if (keyword) {
      whereOpt.title = { $regex: keyword, $options: 'i' };
    }

    // 3. 关键：强制转换分页参数为 Number，防止运算错误
    const p = Number(page) || 1;
    const pSize = Number(pageSize) || 10;
    const skipNum = (p - 1) * pSize; // 确保这里是纯数字运算

    return await this.questionModel
      .find(whereOpt)
      .sort({ _id: -1 }) // 按 id 降序排序
      .skip(skipNum) // 分页，跳过 (page - 1) 页的记录
      .limit(pSize)
      .exec(); // 显式执行
  }

  async countAll({ keyword = '', isDeleted = false, isStar, author = '' }) {
    const whereOpt: any = {
      author,
      isDeleted: String(isDeleted) === 'true', // 强制转布尔
    };
    // ✅ 只有在【非回收站】模式下，才去过滤星标状态
    // 或者明确指定了要看回收站里的星标文件时才过滤
    if (isDeleted === false && isStar != null) {
      whereOpt.isStar = isStar;
    }
    if (keyword) {
      // 提示：使用 $regex 字符串比 RegExp 对象在某些版本的驱动中更稳定
      whereOpt.title = { $regex: keyword, $options: 'i' };
    }
    return await this.questionModel.countDocuments(whereOpt);
  }

  //复制问卷
  async duplicate(id: string, author: string) {
    const question = await this.questionModel.findById(id);
    const newQuestion = new this.questionModel({
      ...question.toObject(),
      _id: new mongoose.Types.ObjectId(), //生成一个新的mongodb的ObjectId
      title: question.title + '副本',
      author,
      isPublished: false,
      isStar: false,
      componentList: question.componentList.map((item) => {
        return {
          ...item,
          fe_id: nanoid(),
        };
      }),
    });
    return await newQuestion.save();
  }
}
