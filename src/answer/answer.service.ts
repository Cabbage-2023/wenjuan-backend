import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Answer } from './schema/answer.schema';

@Injectable()
export class AnswerService {
  // 注入 Answer 模型
  constructor(
    @InjectModel(Answer.name)
    private readonly answerModel,
  ) {}

  async create(answerInfo) {
    // 1. 先检查，如果没有 id，立刻报错拦截
    if (!answerInfo.questionId) {
      throw new HttpException('缺少问卷id', HttpStatus.BAD_REQUEST);
    }
    // 2. 只有通过了上面的检查，才会执行到这里
    const answer = new this.answerModel(answerInfo);
    return await answer.save();
  }

  async count(questionId: string) {
    // 修正：将 count 修改为 countDocuments
    return await this.answerModel.countDocuments({ questionId });
  }

  async findAll(questionId: string, opt: { page: number; pageSize: number }) {
    if (!questionId) return [];
    const { page = 1, pageSize = 10 } = opt;
    const list = await this.answerModel
      .find({ questionId })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return list;
  }
}
