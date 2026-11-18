import { InvalidPhoneNumberError } from './errors/invalid-phone-number.error';

const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;
const SAUDI_COUNTRY_CODE = '966';
const VISIBLE_TAIL_DIGITS = 3;

/** Accepts 05XXXXXXXX, 5XXXXXXXX, 9665XXXXXXXX, +9665XXXXXXXX and 009665XXXXXXXX. */
const SAUDI_MOBILE = /^(?:\+?966|00966|0)?(5\d{8})$/;
const SEPARATORS = /[\s\-().]/g;

function toLatinDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (char) => {
    const code = char.charCodeAt(0);
    const zero =
      code >= EXTENDED_ARABIC_INDIC_ZERO ? EXTENDED_ARABIC_INDIC_ZERO : ARABIC_INDIC_ZERO;
    return String(code - zero);
  });
}

/**
 * A Saudi mobile number in E.164 (`+9665XXXXXXXX`). Arabic-Indic digits are normalized.
 * Collected at booking; gym staff only ever see `masked`.
 */
export class PhoneNumber {
  private constructor(readonly value: string) {}

  static parse(raw: string): PhoneNumber {
    const cleaned = toLatinDigits(raw.trim()).replace(SEPARATORS, '');
    const match = SAUDI_MOBILE.exec(cleaned);
    const subscriber = match?.[1];
    if (subscriber === undefined) {
      throw new InvalidPhoneNumberError();
    }
    return new PhoneNumber(`+${SAUDI_COUNTRY_CODE}${subscriber}`);
  }

  /** Local format, e.g. `0501234567`. */
  get local(): string {
    return `0${this.value.slice(SAUDI_COUNTRY_CODE.length + 1)}`;
  }

  /** What gym staff see (PDPL): `05XX XXX 412`. */
  get masked(): string {
    return `05XX XXX ${this.value.slice(-VISIBLE_TAIL_DIGITS)}`;
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }
}
