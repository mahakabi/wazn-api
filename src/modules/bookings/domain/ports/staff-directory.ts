import { type StaffMembership } from '../staff-membership';

export interface StaffDirectory {
  membershipsOf(userId: string): Promise<StaffMembership[]>;
}

export const STAFF_DIRECTORY = Symbol('STAFF_DIRECTORY');
