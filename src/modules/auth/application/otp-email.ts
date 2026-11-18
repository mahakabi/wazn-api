import { type OutgoingEmail } from '../../../common/domain/email-sender';
import { type EmailAddress } from '../domain/email-address';
import { OTP_POLICY } from '../domain/otp-policy';

export type MessageLocale = 'en' | 'ar';

const TTL_MINUTES = OTP_POLICY.ttlSeconds / 60;

interface Copy {
  subject: string;
  intro: string;
  expiry: string;
  warning: string;
  dir: 'ltr' | 'rtl';
}

const COPY: Record<MessageLocale, Copy> = {
  en: {
    subject: 'Your Wazn sign-in code',
    intro: 'Your Wazn sign-in code is:',
    expiry: `It expires in ${TTL_MINUTES} minutes.`,
    warning: "If you didn't request it, ignore this email. Don't share the code with anyone.",
    dir: 'ltr',
  },
  ar: {
    subject: 'رمز الدخول إلى وزن',
    intro: 'رمز الدخول إلى وزن:',
    expiry: `صالح لمدة ${TTL_MINUTES} دقائق.`,
    warning: 'إذا لم تطلب هذا الرمز فتجاهل الرسالة، ولا تشارك الرمز مع أحد.',
    dir: 'rtl',
  },
};

/** The sign-in email. The code is digits only, so it needs no HTML escaping. */
export function otpEmail(to: EmailAddress, code: string, locale: MessageLocale): OutgoingEmail {
  const copy = COPY[locale];
  return {
    to: to.value,
    subject: `${copy.subject}: ${code}`,
    text: `${copy.intro} ${code}\n${copy.expiry}\n\n${copy.warning}`,
    html: `<div dir="${copy.dir}" style="font-family:Arial,sans-serif;color:#0C1412">
<p>${copy.intro}</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px;direction:ltr">${code}</p>
<p>${copy.expiry}</p>
<p style="color:#5E7068;font-size:13px">${copy.warning}</p>
</div>`,
  };
}
