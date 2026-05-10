import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message ? exception.message : '服务器错误';

    response.status(status).json({
      errno: status, // 通常我会建议这里也叫 errno，和你的拦截器对应上
      data: {
        errno: -1,
        message, // 加上这个，前端才知道具体的报错原因
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
