import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { type AlertPreference } from '../domain/alert-preference';
import { type SavedGym } from '../domain/saved-gym';
import { type SavedGymRepository } from '../domain/saved-gym-repository';

interface SavedRow {
  branchId: string;
  alertMode: SavedGym['alertMode'];
  alertBelow: number | null;
  createdAt: Date;
}

function toSavedGym(row: SavedRow): SavedGym {
  return {
    branchId: row.branchId,
    alertMode: row.alertMode,
    alertBelow: row.alertBelow,
    savedAt: row.createdAt,
  };
}

@Injectable()
export class PrismaSavedGymRepository implements SavedGymRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<SavedGym[]> {
    const rows = await this.prisma.savedGym.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toSavedGym);
  }

  async save(userId: string, branchId: string, preference: AlertPreference): Promise<SavedGym> {
    const data = { alertMode: preference.mode, alertBelow: preference.below };
    const row = await this.prisma.savedGym.upsert({
      where: { userId_branchId: { userId, branchId } },
      create: { userId, branchId, ...data },
      update: data,
    });
    return toSavedGym(row);
  }

  async remove(userId: string, branchId: string): Promise<void> {
    await this.prisma.savedGym.deleteMany({ where: { userId, branchId } });
  }
}
