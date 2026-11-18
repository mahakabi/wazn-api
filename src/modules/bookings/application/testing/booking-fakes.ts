import { type AppSettings } from '../../../settings/domain/app-settings';
import { type SettingsReader } from '../../../settings/domain/settings-reader';
import { type BookablePlan } from '../../domain/bookable-plan';
import { BookingCode } from '../../domain/booking-code';
import { type BookablePlanReader } from '../../domain/ports/bookable-plan-reader';
import { type BookingCodeGenerator } from '../../domain/ports/booking-code-generator';
import {
  type MemberContact,
  type MemberContactReader,
} from '../../domain/ports/member-contact-reader';
import { type StaffDirectory } from '../../domain/ports/staff-directory';
import { type StaffMembership } from '../../domain/staff-membership';

export class StubSettingsReader implements SettingsReader {
  constructor(
    public settings: AppSettings = {
      defaultCommissionRate: '0.10',
      codeValidityDays: 7,
      priceFreshnessDays: 30,
    },
  ) {}

  get(): Promise<AppSettings> {
    return Promise.resolve(this.settings);
  }
}

export class StubBookablePlanReader implements BookablePlanReader {
  constructor(public plan: BookablePlan | null) {}

  find(): Promise<BookablePlan | null> {
    return Promise.resolve(this.plan);
  }
}

export class StubMemberContactReader implements MemberContactReader {
  constructor(public contact: MemberContact | null) {}

  find(): Promise<MemberContact | null> {
    return Promise.resolve(this.contact);
  }
}

export class StubStaffDirectory implements StaffDirectory {
  constructor(public memberships: StaffMembership[] = []) {}

  membershipsOf(): Promise<StaffMembership[]> {
    return Promise.resolve(this.memberships);
  }
}

/** Hands out the given suffixes in order (to simulate collisions). */
export class ScriptedCodeGenerator implements BookingCodeGenerator {
  constructor(private readonly suffixes: string[]) {}

  generate(): BookingCode {
    const next = this.suffixes.shift();
    if (next === undefined) throw new Error('No more scripted codes');
    return BookingCode.fromSuffix(next);
  }
}
