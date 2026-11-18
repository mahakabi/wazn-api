import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { type RefreshTokenRepository } from '../domain/ports/refresh-token-repository';
import { type NewRefreshToken, type RefreshTokenRecord } from '../domain/refresh-token-record';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(token: NewRefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({ data: token });
  }

  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, familyId: true, expiresAt: true, revokedAt: true },
    });
  }

  rotate(currentId: string, next: NewRefreshToken, at: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      // Conditional update = optimistic lock: only one concurrent refresh can revoke it.
      const { count } = await tx.refreshToken.updateMany({
        where: { id: currentId, revokedAt: null },
        data: { revokedAt: at },
      });
      if (count === 0) {
        return false;
      }
      await tx.refreshToken.create({ data: next });
      return true;
    });
  }

  async revokeFamily(familyId: string, at: Date): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: at },
    });
  }
}
