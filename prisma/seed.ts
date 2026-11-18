import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { SETTING_DEFAULTS } from '../src/modules/settings/domain/setting-defaults';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import { SEED_GYMS, SEED_USERS, type SeedBranch, type SeedUser } from './seed-data';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number): Date => new Date(Date.now() + days * DAY_MS);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

async function seedSettings(): Promise<void> {
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    // Keep admin-edited values: only create missing keys.
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }
}

async function seedBranch(gymId: string, branch: SeedBranch): Promise<void> {
  const data = {
    gymId,
    district: branch.district,
    gender: branch.gender,
    lat: branch.lat,
    lng: branch.lng,
    photos: [],
  };
  await prisma.branch.upsert({
    where: { id: branch.id },
    create: { id: branch.id, ...data },
    update: data,
  });

  for (const plan of branch.plans) {
    const planId = `${branch.id}_m${plan.months}`;
    const planData = {
      branchId: branch.id,
      months: plan.months,
      price: plan.price,
      renewalPrice: plan.renewalPrice,
      joiningFee: plan.joiningFee,
      freezeDays: plan.freezeDays,
      refundDays: plan.refundDays,
      verifiedAt: daysFromNow(-plan.verifiedDaysAgo),
    };
    await prisma.plan.upsert({
      where: { id: planId },
      create: { id: planId, ...planData },
      update: planData,
    });
  }

  for (const offer of branch.offers) {
    const planId = `${branch.id}_m${offer.months}`;
    const plan = branch.plans.find((candidate) => candidate.months === offer.months);
    if (!plan) throw new Error(`Seed offer on ${planId} has no matching plan`);
    const offerId = `${planId}_offer`;
    const offerData = {
      planId,
      title: offer.title,
      price: offer.price,
      wasPrice: plan.price,
      startsAt: daysFromNow(offer.startsInDays),
      endsAt: daysFromNow(offer.endsInDays),
      status: offer.status,
      source: offer.source,
      confidence: offer.confidence ?? null,
    };
    await prisma.offer.upsert({
      where: { id: offerId },
      create: { id: offerId, ...offerData },
      update: offerData,
    });
  }
}

async function seedGyms(): Promise<void> {
  for (const gym of SEED_GYMS) {
    const data = {
      nameEn: gym.nameEn,
      nameAr: gym.nameAr,
      status: gym.status,
      commissionRate: gym.commissionRate ?? null,
    };
    await prisma.gym.upsert({
      where: { id: gym.id },
      create: { id: gym.id, ...data },
      update: data,
    });
    for (const branch of gym.branches) {
      await seedBranch(gym.id, branch);
    }
  }
}

async function seedUser(user: SeedUser): Promise<void> {
  const data = { phone: user.phone, name: user.name, role: Role[user.role] };
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, ...data },
    update: data,
  });
  if (!user.staff) return;
  const staffData = {
    userId: user.id,
    gymId: user.staff.gymId,
    role: user.staff.role,
    branchId: user.staff.branchId ?? null,
  };
  await prisma.staff.upsert({
    where: { userId_gymId: { userId: user.id, gymId: user.staff.gymId } },
    create: staffData,
    update: staffData,
  });
}

async function seedUsers(): Promise<void> {
  const adminPhone = process.env.SEED_ADMIN_PHONE ?? '+966500000001';
  await seedUser({ id: 'seed_user_admin', phone: adminPhone, name: 'Admin', role: 'ADMIN' });
  for (const user of SEED_USERS) {
    await seedUser(user);
  }
}

async function main(): Promise<void> {
  await seedSettings();
  await seedGyms();
  await seedUsers();
  const [gyms, branches, plans, offers] = await Promise.all([
    prisma.gym.count(),
    prisma.branch.count(),
    prisma.plan.count(),
    prisma.offer.count(),
  ]);
  console.log(`Seeded: ${gyms} gyms, ${branches} branches, ${plans} plans, ${offers} offers`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
