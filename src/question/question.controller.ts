import { Controller, Get, Query, Param, Patch, Body, Post, Delete, Request } from '@nestjs/common';

import { QuestionDto } from './dto/question.dto';
import { QuestionService } from './question.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('question')
export class QuestionController {
  // 从 QuestionService 中注入 QuestionService
  constructor(private readonly questionService: QuestionService) {}

  // @Get('test')
  // test() {
  //   throw new HttpException('test error', 400);
  // }

  @Post()
  create(@Request() req) {
    const { username } = req.user;
    return this.questionService.create(username);
  }

  @Get()
  async findAll(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('isDeleted') isDeleted: string, // 先拿字符串
    @Query('isStar') isStar: string, // 先拿字符串
    @Request() req,
  ) {
    const { username } = req.user;

    // 显式转换为布尔值
    const isDeletedBool = isDeleted === 'true';
    const isStarBool = isStar === 'true';

    const list = await this.questionService.findAllList({
      keyword,
      page: +page,
      pageSize: +pageSize,
      isDeleted: isDeletedBool,
      isStar: isStarBool,
      author: username,
    });
    const count = await this.questionService.countAll({
      keyword,
      author: username,
      isDeleted: isDeletedBool,
      isStar: isStarBool,
    });
    return {
      list,
      count,
    };
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() questionDto: QuestionDto, @Request() req) {
    const { username } = req.user;
    return this.questionService.update(id, questionDto, username);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string, @Request() req) {
    const { username } = req.user;
    return this.questionService.delete(id, username);
  }

  @Delete()
  deleteMany(@Body() body, @Request() req) {
    const { username } = req.user;
    const { ids = [] } = body;
    return this.questionService.deleteMany(username, ids);
  }

  @Post('duplicate/:id')
  duplicate(@Param('id') id: string, @Request() req) {
    const { username } = req.user;
    return this.questionService.duplicate(id, username);
  }
}
