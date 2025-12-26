
export interface SmsService {
  sendOtp(phone: string, otp: number): Promise<void>;
}

export const SMS_SERVICE = 'SMS_SERVICE';
