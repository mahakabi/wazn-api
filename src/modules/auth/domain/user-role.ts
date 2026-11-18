export const USER_ROLES = ['MEMBER', 'GYM_STAFF', 'ADMIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];
