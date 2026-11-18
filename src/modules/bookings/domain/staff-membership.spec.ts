import { effectiveStatus } from './booking-status';
import { membershipFor } from './staff-membership';

describe('membershipFor (staff scoping)', () => {
  const place = { gymId: 'gym_a', branchId: 'branch_1' };

  it('allows gym-wide staff and staff of that branch', () => {
    expect(membershipFor([{ staffId: 's1', gymId: 'gym_a', branchId: null }], place)?.staffId).toBe(
      's1',
    );
    expect(
      membershipFor([{ staffId: 's2', gymId: 'gym_a', branchId: 'branch_1' }], place)?.staffId,
    ).toBe('s2');
  });

  it('rejects another branch or another gym', () => {
    expect(
      membershipFor([{ staffId: 's', gymId: 'gym_a', branchId: 'branch_2' }], place),
    ).toBeNull();
    expect(membershipFor([{ staffId: 's', gymId: 'gym_b', branchId: null }], place)).toBeNull();
  });
});

describe('effectiveStatus', () => {
  const now = new Date('2026-11-18T12:00:00Z');

  it('treats an ISSUED booking past expiry as EXPIRED', () => {
    expect(effectiveStatus({ status: 'ISSUED', expiresAt: now }, now)).toBe('EXPIRED');
    expect(effectiveStatus({ status: 'ISSUED', expiresAt: new Date(now.getTime() + 1) }, now)).toBe(
      'ISSUED',
    );
    expect(effectiveStatus({ status: 'CONFIRMED', expiresAt: now }, now)).toBe('CONFIRMED');
  });
});
