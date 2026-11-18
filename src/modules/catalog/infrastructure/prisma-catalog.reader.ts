import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { GymStatus, OfferStatus, Prisma } from '../../../generated/prisma/client';
import {
  type BranchHit,
  type CatalogReader,
  type NearbyQuery,
  type TextQuery,
} from '../domain/catalog-reader';
import {
  type CatalogBranch,
  type Gender,
  PLAN_MONTHS,
  type PlanMonths,
} from '../domain/catalog-types';

const VISIBLE_STATUSES = [GymStatus.LISTED, GymStatus.PARTNER];

/** A women-only or men-only filter also includes mixed gyms. */
function genderCondition(gender: Gender | undefined): Prisma.Sql {
  if (gender === undefined) return Prisma.empty;
  if (gender === 'MIXED') return Prisma.sql`AND b.gender = 'MIXED'`;
  return Prisma.sql`AND b.gender IN (${gender}::"Gender", 'MIXED')`;
}

function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function isPlanMonths(value: number): value is PlanMonths {
  return (PLAN_MONTHS as readonly number[]).includes(value);
}

const branchInclude = {
  gym: true,
  plans: { include: { offers: { where: { status: OfferStatus.LIVE } } } },
} satisfies Prisma.BranchInclude;

type BranchRow = Prisma.BranchGetPayload<{ include: typeof branchInclude }>;

function toCatalogBranch(row: BranchRow): CatalogBranch {
  return {
    id: row.id,
    gym: { id: row.gym.id, nameEn: row.gym.nameEn, nameAr: row.gym.nameAr, status: row.gym.status },
    district: row.district,
    city: row.city,
    gender: row.gender,
    lat: row.lat,
    lng: row.lng,
    photos: row.photos,
    // The DB CHECK constraint guarantees months ∈ {1,3,6,12}; the guard keeps the type honest.
    plans: row.plans.flatMap((plan) => {
      const { months } = plan;
      if (!isPlanMonths(months)) return [];
      return [
        {
          id: plan.id,
          months,
          price: plan.price,
          renewalPrice: plan.renewalPrice,
          joiningFee: plan.joiningFee,
          freezeDays: plan.freezeDays,
          refundDays: plan.refundDays,
          verifiedAt: plan.verifiedAt,
          offers: plan.offers.map((offer) => ({
            id: offer.id,
            title: offer.title,
            price: offer.price,
            wasPrice: offer.wasPrice,
            startsAt: offer.startsAt,
            endsAt: offer.endsAt,
          })),
        },
      ];
    }),
  };
}

@Injectable()
export class PrismaCatalogReader implements CatalogReader {
  constructor(private readonly prisma: PrismaService) {}

  async findNearby(query: NearbyQuery): Promise<BranchHit[]> {
    // geography + ST_DWithin uses the GiST index on branches.location; distances are in meters.
    const rows = await this.prisma.$queryRaw<{ branchId: string; distanceMeters: number }[]>`
      SELECT b.id AS "branchId",
             ST_Distance(b.location, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography)::float8 AS "distanceMeters"
      FROM branches b
      JOIN gyms g ON g.id = b.gym_id
      WHERE g.status IN ('LISTED', 'PARTNER')
        AND ST_DWithin(b.location, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography, ${query.radiusMeters})
        ${genderCondition(query.gender)}
      ORDER BY "distanceMeters"
      LIMIT ${query.limit}`;
    return rows.map((row) => ({
      branchId: row.branchId,
      distanceMeters: Math.round(row.distanceMeters),
    }));
  }

  async search(query: TextQuery): Promise<BranchHit[]> {
    const pattern = `%${escapeLike(query.text)}%`;
    const rows = await this.prisma.$queryRaw<{ branchId: string }[]>`
      SELECT b.id AS "branchId"
      FROM branches b
      JOIN gyms g ON g.id = b.gym_id
      WHERE g.status IN ('LISTED', 'PARTNER')
        AND (g.name_en ILIKE ${pattern} OR g.name_ar ILIKE ${pattern} OR b.district ILIKE ${pattern})
        ${genderCondition(query.gender)}
      ORDER BY g.name_en, b.district
      LIMIT ${query.limit}`;
    return rows.map((row) => ({ branchId: row.branchId, distanceMeters: null }));
  }

  async loadBranches(ids: readonly string[]): Promise<CatalogBranch[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.branch.findMany({
      where: { id: { in: [...ids] }, gym: { status: { in: VISIBLE_STATUSES } } },
      include: branchInclude,
    });
    return rows.map(toCatalogBranch);
  }
}
