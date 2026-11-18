import { OTP_POLICY } from '../../domain/otp-policy';

export const MESSAGE_LOCALES = ['en', 'ar'] as const;
export const EMAIL_MAX_LENGTH = 254;
export const REFRESH_TOKEN_MAX_LENGTH = 256;
export const OTP_CODE_PATTERN = new RegExp(`^\\d{${OTP_POLICY.codeLength}}$`);
