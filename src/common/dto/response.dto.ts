import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({ example: 0, description: '状态码, 0表示成功' })
  code!: number;

  @ApiProperty({ example: 'success', description: '响应消息' })
  message!: string;

  @ApiProperty({ description: '响应数据' })
  data?: T;
}
