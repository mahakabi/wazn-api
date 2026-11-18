export interface MemberContact {
  readonly phone: string | null;
}

export interface MemberContactReader {
  find(userId: string): Promise<MemberContact | null>;
}

export const MEMBER_CONTACT_READER = Symbol('MEMBER_CONTACT_READER');
