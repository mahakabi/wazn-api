import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { type AppSettings } from '../domain/app-settings';
import { parseAppSettings } from '../domain/parse-app-settings';
import { type SettingsReader } from '../domain/settings-reader';

@Injectable()
export class PrismaSettingsReader implements SettingsReader {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<AppSettings> {
    const rows = await this.prisma.setting.findMany();
    return parseAppSettings(new Map(rows.map((row) => [row.key, row.value])));
  }
}
