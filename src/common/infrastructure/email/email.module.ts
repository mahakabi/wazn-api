import { Global, Module } from '@nestjs/common';
import { EMAIL_SENDER } from '../../domain/email-sender';
import { SmtpEmailSender } from './smtp-email.sender';

@Global()
@Module({
  providers: [{ provide: EMAIL_SENDER, useClass: SmtpEmailSender }],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
