import { Controller, Post, Body } from '@nestjs/common';

import { AnswerService } from './answer.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Public()
  @Post()
  async create(@Body() answerInfo) {
    return await this.answerService.create(answerInfo);
  }
}
