import { type AlertMode } from './alert-mode';
import { AlertBelowRequiredError } from './errors/alert-below-required.error';

/**
 * Business rule #9: price below X, any new offer, or off. The threshold only exists for
 * BELOW_PRICE, so it's cleared for the other modes. (Sending also needs WhatsApp consent.)
 */
export class AlertPreference {
  private constructor(
    readonly mode: AlertMode,
    readonly below: number | null,
  ) {}

  static of(mode: AlertMode, below?: number | null): AlertPreference {
    if (mode !== 'BELOW_PRICE') {
      return new AlertPreference(mode, null);
    }
    if (below == null || !Number.isInteger(below) || below <= 0) {
      throw new AlertBelowRequiredError();
    }
    return new AlertPreference(mode, below);
  }
}
