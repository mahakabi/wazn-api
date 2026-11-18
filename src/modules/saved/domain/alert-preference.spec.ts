import { AlertPreference } from './alert-preference';
import { AlertBelowRequiredError } from './errors/alert-below-required.error';

describe('AlertPreference', () => {
  it('keeps the threshold only for BELOW_PRICE', () => {
    expect(AlertPreference.of('BELOW_PRICE', 250)).toMatchObject({
      mode: 'BELOW_PRICE',
      below: 250,
    });
    expect(AlertPreference.of('ANY_OFFER', 250)).toMatchObject({ mode: 'ANY_OFFER', below: null });
    expect(AlertPreference.of('OFF')).toMatchObject({ mode: 'OFF', below: null });
  });

  it.each([undefined, null, 0, -5, 99.5])(
    'requires a positive whole SAR threshold, not %p',
    (below) => {
      expect(() => AlertPreference.of('BELOW_PRICE', below)).toThrow(AlertBelowRequiredError);
    },
  );
});
