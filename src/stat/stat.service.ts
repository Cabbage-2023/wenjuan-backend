import { Injectable } from '@nestjs/common';

import { QuestionService } from '../question/question.service';
import { AnswerService } from '../answer/answer.service';

@Injectable()
export class StatService {
  constructor(
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
  ) {}
  private _getRadioOptText(value, props: any = {}) {
    const { options = [] } = props;
    const length = options.length;

    for (let i = 0; i < length; i++) {
      const item = options[i];
      if (item.value === value) {
        return item.text;
        break; // 实际上 return 后 break 不执行，但保留了视频原样
      }
    }

    return '';
  }

  private _getCheckboxOptText(value, props: any = {}) {
    const { list = [] } = props;
    const length = list.length;

    for (let i = 0; i < length; i++) {
      const item = list[i];
      if (item.value === value) {
        return item.text;
        break;
      }
    }

    return '';
  }

  /**
   * 生成答案信息，格式如 { componentId1: value1, componentId2: value2 }
   * @param {Object} question 问卷信息
   * @param {Array} answerList 答卷列表
   */
  private _genAnswersInfo(question, answerList = []) {
    const res: { [key: string]: string } = {};

    const { componentList = [] } = question;

    answerList.forEach((a: any) => {
      const { componentId, value = [] } = a;
      if (value == null) return;
      // ✅ 核心修复：如果是字符串且包含逗号，转为数组；如果已经是数组则保留
      let valArr: string[] = [];
      if (Array.isArray(value)) {
        valArr = value;
      } else if (typeof value === 'string') {
        // 兼容 "1,2,3" 这种存法
        valArr = value.includes(',') ? value.split(',') : [value];
      }

      // 获取组件信息
      const comp = componentList.filter((c) => c.fe_id === componentId)[0];
      if (!comp) return; // 如果找不到组件定义，直接跳过

      const { type, props = {} } = comp;

      if (type === 'questionRadio') {
        // 单选
        res[componentId] = valArr.map((v) => this._getRadioOptText(v, props)).toString();
      } else if (type === 'questionCheckbox') {
        // 多选
        res[componentId] = valArr.map((v) => this._getCheckboxOptText(v, props)).toString();
      } else {
        // 其他（输入框等直接显示的内容）
        res[componentId] = valArr.toString();
      }
    });

    return res;
  }

  async getQuestionStatListAndCount(questionId: string, opt: { page: number; pageSize: number }) {
    const noData = { list: [], count: 0 };
    if (!questionId) return noData;

    const q = await this.questionService.findOne(questionId);
    if (!q) return noData;

    const total = await this.answerService.count(questionId);
    if (total <= 0) return noData;

    const answers = await this.answerService.findAll(questionId, opt);
    const list = answers.map((a) => {
      return {
        _id: a._id,
        ...this._genAnswersInfo(q, a.answerList),
      };
    });

    return { list, total };
  }

  async getComponentStat(questionId: string, componentId: string) {
    if (!questionId || !componentId) return [];

    // 1. 获取问卷信息
    const q = await this.questionService.findOne(questionId);
    if (q == null) return [];

    // 2. 获取组件信息
    const { componentList = [] } = q;
    const comp = componentList.filter((c) => c.fe_id === componentId)[0];
    if (comp == null) return [];

    const { type, props = {} } = comp;
    // 单组件统计，目前只针对单选和多选，其他（如输入框）不统计
    if (type !== 'questionRadio' && type !== 'questionCheckbox') {
      return [];
    }

    // 3. 获取答卷列表（这里获取所有，不分页，以便统计全量数据）
    const total = await this.answerService.count(questionId);
    if (total === 0) return [];
    const answers = await this.answerService.findAll(questionId, {
      page: 1,
      pageSize: total,
    });

    // 4. 累加各个 value 的数量
    // 修正 TS 报错：显式定义对象类型，防止推断为 never
    const countInfo: Record<string, number> = {};

    answers.forEach((a) => {
      const { answerList = [] } = a;
      answerList.forEach((al: any) => {
        // ✅ 关键点 1：这里统一改为匹配 componentId (或者是你数据库里存的那个字段名)
        if (al.componentId !== componentId) return;

        // ✅ 关键点 2：处理“逗号字符串”数据
        let valArr: string[] = [];
        if (Array.isArray(al.value)) {
          valArr = al.value;
        } else if (typeof al.value === 'string') {
          // 兼容 "item1,item2" 格式，如果没有逗号，split 会返回包含原字符串的单元素数组
          valArr = al.value.split(',').filter(Boolean);
        }

        valArr.forEach((v) => {
          const trimmedV = v.trim(); // 防止空格干扰匹配
          if (countInfo[trimmedV] == null) countInfo[trimmedV] = 0;
          countInfo[trimmedV]++;
        });
      });
    });

    // 5. 整理数据格式给前端
    const list: Array<{ name: string; count: number }> = [];
    for (const val in countInfo) {
      // 根据 val 计算对应的文字描述（text）
      let text = '';
      if (type === 'questionRadio') {
        text = this._getRadioOptText(val, props);
      }
      if (type === 'questionCheckbox') {
        text = this._getCheckboxOptText(val, props);
      }

      list.push({
        name: text || val, // 如果找不到文字，就显示原始值
        count: countInfo[val],
      });
    }

    return list;
  }
}
