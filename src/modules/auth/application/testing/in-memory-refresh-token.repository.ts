import { type RefreshTokenRepository } from '../../domain/ports/refresh-token-repository';
import { type NewRefreshToken, type RefreshTokenRecord } from '../../domain/refresh-token-record';

interface Row extends RefreshTokenRecord {
  readonly tokenHash: string;
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  readonly rows: Row[] = [];

  create(token: NewRefreshToken): Promise<void> {
    this.rows.push({ ...token, id: `rt_${this.rows.length + 1}`, revokedAt: null });
    return Promise.resolve();
  }

  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return Promise.resolve(this.rows.find((row) => row.tokenHash === tokenHash) ?? null);
  }

  async rotate(currentId: string, next: NewRefreshToken, at: Date): Promise<boolean> {
    const index = this.rows.findIndex((row) => row.id === currentId && row.revokedAt === null);
    const current = this.rows[index];
    if (current === undefined) return false;
    this.rows[index] = { ...current, revokedAt: at };
    await this.create(next);
    return true;
  }

  revokeFamily(familyId: string, at: Date): Promise<void> {
    this.rows.forEach((row, index) => {
      if (row.familyId === familyId && row.revokedAt === null) {
        this.rows[index] = { ...row, revokedAt: at };
      }
    });
    return Promise.resolve();
  }

  activeIn(familyId: string): Row[] {
    return this.rows.filter((row) => row.familyId === familyId && row.revokedAt === null);
  }
}
