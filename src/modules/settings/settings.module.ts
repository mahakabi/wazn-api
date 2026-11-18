import { Global, Module } from '@nestjs/common';
import { SETTINGS_READER } from './domain/settings-reader';
import { PrismaSettingsReader } from './infrastructure/prisma-settings.reader';

@Global()
@Module({
  providers: [{ provide: SETTINGS_READER, useClass: PrismaSettingsReader }],
  exports: [SETTINGS_READER],
})
export class SettingsModule {}
