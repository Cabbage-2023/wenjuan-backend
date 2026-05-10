import { Controller, Get, Query, Param, Patch, Body, Post, Delete } from '@nestjs/common';

import { QuestionDto } from './dto/question.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  // 从 QuestionService 中注入 QuestionService
  constructor(private readonly questionService: QuestionService) {}

  // @Get('test')
  // test() {
  //   throw new HttpException('test error', 400);
  // }

  @Post()
  create() {
    return this.questionService.create();
  }

  @Get()
  async findAll(@Query('keyword') keyword: string, @Query('page') page: number, @Query('pageSize') pageSize: number) {
    const list = await this.questionService.findAllList({ keyword, page, pageSize });
    const count = await this.questionService.countAll({ keyword });
    return {
      list,
      count,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() questionDto: QuestionDto) {
    return this.questionService.update(id, questionDto);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string) {
    return this.questionService.delete(id);
  }
}
