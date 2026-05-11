import { Controller, Post, Body, HttpException, HttpStatus, Redirect, Get } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    try {
      return await this.userService.create(userDto);
    } catch (error) {
      return new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('info')
  @Redirect('/api/auth/profile', 302) //GET请求，302临时重定向，301永久重定向
  info() {
    return;
  }

  @Public()
  @Post('login')
  @Redirect('/api/auth/login', 307) //POST请求，307临时重定向，308永久重定向
  login() {
    return;
  }
}
