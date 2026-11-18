import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { GymStatus, OfferStatus } from '../../../generated/prisma/client';
import { PLAN_MONTHS, type PlanMonths } from '../../catalog/domain/catalog-types';
import { type BookablePlan } from '../domain/bookable-plan';
import { type BookablePlanReader } from '../domain/ports/bookable-plan-reader';

function isPlanMonths(value: number): value is PlanMonths {
  return (PLAN_MONTHS as readonly number[]).includes(value);
}

@Injectable()
export class PrismaBookablePlanReader implements BookablePlanReader {
  constructor(private readonly prisma: PrismaService) {}

  async find(planId: string): Promise<BookablePlan | null> {
    const row = await this.prisma.plan.findFirst({
      where: {
        id: planId,
        branch: { gym: { status: { in: [GymStatus.LISTED, GymStatus.PARTNER] } } },
      },
      include: {
        offers: { where: { status: OfferStatus.LIVE } },
        branch: { include: { gym: true } },
      },
    });
    if (row === null || !isPlanMonths(row.months)) return null;
    const { branch } = row;
    return {
      gymStatus: branch.gym.status,
      place: {
        branchId: branch.id,
        district: branch.district,
        gymId: branch.gym.id,
        gymNameEn: branch.gym.nameEn,
        gymNameAr: branch.gym.nameAr,
      },
      plan: {
        id: row.id,
        months: row.months,
        price: row.price,
        renewalPrice: row.renewalPrice,
        joiningFee: row.joiningFee,
        freezeDays: row.freezeDays,
        refundDays: row.refundDays,
        verifiedAt: row.verifiedAt,
        offers: row.offers.map((offer) => ({
          id: offer.id,
          title: offer.title,
          price: offer.price,
          wasPrice: offer.wasPrice,
          startsAt: offer.startsAt,
          endsAt: offer.endsAt,
        })),
      },
    };
  }
}
