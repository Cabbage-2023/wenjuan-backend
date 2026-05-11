import { Controller, Get, Post, Body, Request } from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() userInfo) {
    const { username, password } = userInfo;
    return await this.authService.signIn(username, password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
