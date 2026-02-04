import { ApiProperty, OmitType } from '@nestjs/swagger';

export interface AuthResponseData {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    phone: string;
    role: string;
    nickname?: string;
    avatar?: string;
    is_verified: boolean;
  };
}

export class AuthResponseDto {
  @ApiProperty({ example: 0, description: '状态码, 0表示成功' })
  code!: number;

  @ApiProperty({ example: 'success', description: '响应消息' })
  message!: string;

  @ApiProperty({ description: '响应数据' })
  data!: AuthResponseData;
}
