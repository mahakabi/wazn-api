import { type PhoneNumber } from '../../../common/domain/phone-number';

/** Only the fields present are changed. */
export interface ProfileChanges {
  readonly name?: string;
  readonly locale?: string;
  readonly phone?: PhoneNumber;
  /** Explicit consent for WhatsApp alerts (PDPL). */
  readonly whatsappOptIn?: boolean;
}
