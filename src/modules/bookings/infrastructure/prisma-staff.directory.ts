import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { type StaffDirectory } from '../domain/ports/staff-directory';
import { type StaffMembership } from '../domain/staff-membership';

@Injectable()
export class PrismaStaffDirectory implements StaffDirectory {
  constructor(private readonly prisma: PrismaService) {}

  async membershipsOf(userId: string): Promise<StaffMembership[]> {
    const rows = await this.prisma.staff.findMany({
      where: { userId },
      select: { id: true, gymId: true, branchId: true },
    });
    return rows.map((row) => ({ staffId: row.id, gymId: row.gymId, branchId: row.branchId }));
  }
}
