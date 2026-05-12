import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const res = exception.getResponse() as any;

    // 提取真实的错误消息（处理 NestJS 默认的错误对象）
    const message = res.message ? (Array.isArray(res.message) ? res.message[0] : res.message) : exception.message;

    // 🌟 统一返回结构，确保前端拦截器能直接拿到 msg
    response.status(status).json({
      errno: -1, // 只要不是 0，前端拦截器就会报错
      msg: message, // 前端 message.error(msg) 用的就是这个字段
      data: null, // 报错时 data 传空
    });
  }
}
