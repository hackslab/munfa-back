import { Module } from '@nestjs/common';
import { ConsoleSmsService } from './services/console-sms.service';
import { SMS_SERVICE } from './sms.service.interface';

@Module({
  providers: [
    {
      provide: SMS_SERVICE,
      useClass: ConsoleSmsService,
    },
  ],
  exports: [SMS_SERVICE],
})
export class SmsModule {}
