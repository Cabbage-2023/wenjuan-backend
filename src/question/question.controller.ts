import { Controller, Get, Query, Param, Patch, Body, HttpException } from '@nestjs/common';

import { QuestionDto } from './dto/question.dto';

@Controller('question')
export class QuestionController {
  @Get('test')
  test() {
    throw new HttpException('test error', 400);
  }

  @Get()
  findAll(@Query('keyword') keyword: string, @Query('page') page: number, @Query('pageSize') pageSize: number) {
    console.log(keyword, page, pageSize);
    return {
      questions: ['a', 'b', 'c'],
      count: 10,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      id: id, // 这里应该返回动态拿到的 id，而不是写死的 1
      title: `question ${id}`,
      desc: `description for ${id}`,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() questionDto: QuestionDto) {
    console.log(questionDto);
    return {
      id,
      title: 'aaa',
      desc: 'bbb',
    };
  }
}
