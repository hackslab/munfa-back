import { Injectable } from '@nestjs/common';
import { SmsService } from '../sms.service.interface';

@Injectable()
export class ConsoleSmsService implements SmsService {
  async sendOtp(phone: string, otp: number): Promise<void> {
    console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
  }
}
