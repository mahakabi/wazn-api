export interface StaffMembership {
  readonly staffId: string;
  readonly gymId: string;
  /** null = all branches of the gym. */
  readonly branchId: string | null;
}

/** Business rule: staff only act on bookings of their gym, and of their branch if they have one. */
export function membershipFor(
  memberships: readonly StaffMembership[],
  place: { readonly gymId: string; readonly branchId: string },
): StaffMembership | null {
  return (
    memberships.find(
      (membership) =>
        membership.gymId === place.gymId &&
        (membership.branchId === null || membership.branchId === place.branchId),
    ) ?? null
  );
}
