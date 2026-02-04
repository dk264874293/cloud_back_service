import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const message =
      exceptionResponse?.message ||
      exception.message ||
      'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
    );

    response.status(status).json({
      code: status,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
    });
  }
}
