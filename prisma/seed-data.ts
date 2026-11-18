import { Gender, GymStatus, StaffRole } from '../src/generated/prisma/client';

/**
 * Deterministic sample data for local development: 5 gyms across Riyadh districts.
 * Stable ids make the seed idempotent (safe to run repeatedly).
 */

export interface SeedPlan {
  months: 1 | 3 | 6 | 12;
  price: number;
  renewalPrice: number;
  joiningFee: number;
  freezeDays: number;
  refundDays: number;
  /** How many days ago the price was verified (> 30 = stale). */
  verifiedDaysAgo: number;
}

export interface SeedOffer {
  months: SeedPlan['months'];
  title: string;
  price: number;
  status: 'LIVE' | 'PENDING_REVIEW';
  source: 'instagram' | 'snapchat' | 'website' | 'portal';
  confidence?: 'high' | 'low';
  startsInDays: number;
  endsInDays: number;
}

export interface SeedBranch {
  id: string;
  district: string;
  gender: Gender;
  lat: number;
  lng: number;
  plans: SeedPlan[];
  offers: SeedOffer[];
}

export interface SeedGym {
  id: string;
  nameEn: string;
  nameAr: string;
  status: GymStatus;
  /** Decimal string, e.g. '0.08'. Omit to use the default commission setting. */
  commissionRate?: string;
  branches: SeedBranch[];
}

export interface SeedUser {
  id: string;
  phone: string;
  name: string;
  role: 'MEMBER' | 'GYM_STAFF' | 'ADMIN';
  staff?: { gymId: string; role: StaffRole; branchId?: string };
}

/** Builds the four standard durations from a monthly price, with typical discounts. */
function standardPlans(
  monthly: number,
  options: { joiningFee: number; renewalUplift: number; verifiedDaysAgo: number },
): SeedPlan[] {
  const durations: {
    months: SeedPlan['months'];
    factor: number;
    freeze: number;
    refund: number;
  }[] = [
    { months: 1, factor: 1, freeze: 0, refund: 0 },
    { months: 3, factor: 0.9, freeze: 7, refund: 3 },
    { months: 6, factor: 0.8, freeze: 14, refund: 7 },
    { months: 12, factor: 0.7, freeze: 30, refund: 14 },
  ];
  return durations.map(({ months, factor, freeze, refund }) => {
    const price = Math.round(monthly * months * factor);
    return {
      months,
      price,
      renewalPrice: Math.round(price * options.renewalUplift),
      joiningFee: options.joiningFee,
      freezeDays: freeze,
      refundDays: refund,
      verifiedDaysAgo: options.verifiedDaysAgo,
    };
  });
}

export const SEED_GYMS: SeedGym[] = [
  {
    id: 'seed_gym_pulse',
    nameEn: 'Pulse Fitness',
    nameAr: 'بلس فتنس',
    status: GymStatus.PARTNER,
    branches: [
      {
        id: 'seed_branch_pulse_malqa',
        district: 'Al Malqa',
        gender: Gender.MEN,
        lat: 24.8105,
        lng: 46.615,
        plans: standardPlans(299, { joiningFee: 150, renewalUplift: 1.15, verifiedDaysAgo: 4 }),
        offers: [
          {
            months: 3,
            title: '3 months — winter offer',
            price: 599,
            status: 'LIVE',
            source: 'portal',
            startsInDays: -3,
            endsInDays: 20,
          },
        ],
      },
      {
        id: 'seed_branch_pulse_hittin',
        district: 'Hittin',
        gender: Gender.MEN,
        lat: 24.7602,
        lng: 46.6005,
        plans: standardPlans(279, { joiningFee: 150, renewalUplift: 1.15, verifiedDaysAgo: 12 }),
        offers: [],
      },
    ],
  },
  {
    id: 'seed_gym_lumina',
    nameEn: 'Lumina Ladies Club',
    nameAr: 'نادي لومينا',
    status: GymStatus.PARTNER,
    commissionRate: '0.080',
    branches: [
      {
        id: 'seed_branch_lumina_narjis',
        district: 'Al Narjis',
        gender: Gender.WOMEN,
        lat: 24.865,
        lng: 46.662,
        plans: standardPlans(349, { joiningFee: 0, renewalUplift: 1.1, verifiedDaysAgo: 2 }),
        offers: [
          {
            months: 12,
            title: 'Annual — 2 months free',
            price: 2499,
            status: 'LIVE',
            source: 'instagram',
            confidence: 'high',
            startsInDays: -10,
            endsInDays: 15,
          },
        ],
      },
    ],
  },
  {
    id: 'seed_gym_ironyard',
    nameEn: 'Iron Yard',
    nameAr: 'آيرون يارد',
    status: GymStatus.LISTED,
    branches: [
      {
        id: 'seed_branch_ironyard_yasmin',
        district: 'Al Yasmin',
        gender: Gender.MEN,
        lat: 24.824,
        lng: 46.642,
        // Stale on purpose: exercises the "price may be outdated" warning and admin verify queue.
        plans: standardPlans(199, { joiningFee: 99, renewalUplift: 1.3, verifiedDaysAgo: 45 }),
        offers: [
          {
            months: 6,
            title: '6 months flash sale',
            price: 799,
            status: 'PENDING_REVIEW',
            source: 'snapchat',
            confidence: 'low',
            startsInDays: 1,
            endsInDays: 8,
          },
        ],
      },
    ],
  },
  {
    id: 'seed_gym_core',
    nameEn: 'Core Studio',
    nameAr: 'كور ستوديو',
    status: GymStatus.LISTED,
    branches: [
      {
        id: 'seed_branch_core_hittin',
        district: 'Hittin',
        gender: Gender.WOMEN,
        lat: 24.7555,
        lng: 46.6071,
        plans: standardPlans(420, { joiningFee: 200, renewalUplift: 1, verifiedDaysAgo: 20 }),
        offers: [],
      },
    ],
  },
  {
    id: 'seed_gym_flow',
    nameEn: 'Flow Fitness',
    nameAr: 'فلو فتنس',
    status: GymStatus.PARTNER,
    branches: [
      {
        id: 'seed_branch_flow_malqa',
        district: 'Al Malqa',
        gender: Gender.WOMEN,
        lat: 24.8031,
        lng: 46.6224,
        plans: standardPlans(259, { joiningFee: 100, renewalUplift: 1.2, verifiedDaysAgo: 7 }),
        offers: [
          {
            months: 1,
            title: 'First month special',
            price: 199,
            status: 'LIVE',
            source: 'website',
            confidence: 'high',
            startsInDays: -1,
            endsInDays: 30,
          },
        ],
      },
    ],
  },
];

export const SEED_USERS: SeedUser[] = [
  {
    id: 'seed_user_pulse_owner',
    phone: '+966500000002',
    name: 'Pulse Owner',
    role: 'GYM_STAFF',
    staff: { gymId: 'seed_gym_pulse', role: StaffRole.OWNER },
  },
  {
    id: 'seed_user_pulse_manager',
    phone: '+966500000003',
    name: 'Hittin Manager',
    role: 'GYM_STAFF',
    staff: {
      gymId: 'seed_gym_pulse',
      role: StaffRole.BRANCH_MANAGER,
      branchId: 'seed_branch_pulse_hittin',
    },
  },
  {
    id: 'seed_user_pulse_desk',
    phone: '+966500000004',
    name: 'Malqa Front Desk',
    role: 'GYM_STAFF',
    staff: {
      gymId: 'seed_gym_pulse',
      role: StaffRole.FRONT_DESK,
      branchId: 'seed_branch_pulse_malqa',
    },
  },
  { id: 'seed_user_member', phone: '+966500000010', name: 'Sara', role: 'MEMBER' },
];
