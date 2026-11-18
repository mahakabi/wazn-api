import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { SETTINGS_READER, type SettingsReader } from '../../settings/domain/settings-reader';
import { type ViewContext } from '../domain/branch-view-builder';

/** "Now" plus the freshness window, read once per request. */
@Injectable()
export class ViewContextProvider {
  constructor(
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(SETTINGS_READER) private readonly settings: SettingsReader,
  ) {}

  async current(): Promise<ViewContext> {
    const { priceFreshnessDays } = await this.settings.get();
    return { now: this.clock.now(), priceFreshnessDays };
  }
}
