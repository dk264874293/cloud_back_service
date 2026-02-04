import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

export const Response = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ResponseData => {
    return {
      code: 0,
      message: 'success',
      data,
    };
  },
);
