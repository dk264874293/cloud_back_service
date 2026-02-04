import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@/config/config.service';
import { PaymentType } from './payment.entity';

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);

  constructor(private readonly configService: ConfigService) {}

  async createJsapiPayment(
    paymentNo: string,
    amount: number,
    openid: string,
    description: string,
  ): Promise<any> {
    this.logger.log(`Creating JSAPI payment: ${paymentNo}, amount: ${amount}`);
    const config = this.configService.wechatPay;

    return new Promise((resolve) => {
      resolve({
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: this.generateNonce(),
        package: `prepay_id=${paymentNo}`,
        signType: 'RSA',
        paySign: 'mock_sign',
      });
    });
  }

  async createNativePayment(
    paymentNo: string,
    amount: number,
    description: string,
  ): Promise<string> {
    this.logger.log(`Creating Native payment: ${paymentNo}, amount: ${amount}`);
    const config = this.configService.wechatPay;

    return new Promise((resolve) => {
      resolve(`weixin://wxpay/bizpayurl?pr=${paymentNo}`);
    });
  }

  async verifyCallback(data: any): Promise<boolean> {
    this.logger.log('Verifying wechat payment callback');
    const config = this.configService.wechatPay;
    return true;
  }

  async refund(
    transactionId: string,
    refundAmount: number,
    reason: string,
  ): Promise<any> {
    this.logger.log(`Processing refund: ${transactionId}, amount: ${refundAmount}`);
    const config = this.configService.wechatPay;

    return new Promise((resolve) => {
      resolve({
        refundId: `REF${Date.now()}`,
        status: 'SUCCESS',
      });
    });
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
