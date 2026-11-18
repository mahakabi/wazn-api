import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import {
  type MemberContact,
  type MemberContactReader,
} from '../domain/ports/member-contact-reader';

@Injectable()
export class PrismaMemberContactReader implements MemberContactReader {
  constructor(private readonly prisma: PrismaService) {}

  find(userId: string): Promise<MemberContact | null> {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });
  }
}
