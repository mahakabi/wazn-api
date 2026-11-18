import { Inject, Injectable } from '@nestjs/common';
import { GetBranchSummariesUseCase } from '../../catalog/application/get-branch-summaries.use-case';
import { BranchNotFoundError } from '../../catalog/domain/errors/branch-not-found.error';
import { type AlertMode } from '../domain/alert-mode';
import { AlertPreference } from '../domain/alert-preference';
import { SAVED_GYM_REPOSITORY, type SavedGymRepository } from '../domain/saved-gym-repository';
import { type SavedGymView } from '../domain/saved-gym-view';

export interface SaveGymInput {
  readonly alertMode: AlertMode;
  readonly alertBelow?: number | null;
}

/** Save or update alert settings (idempotent PUT). */
@Injectable()
export class SaveGymUseCase {
  constructor(
    @Inject(SAVED_GYM_REPOSITORY) private readonly saved: SavedGymRepository,
    private readonly summaries: GetBranchSummariesUseCase,
  ) {}

  async execute(userId: string, branchId: string, input: SaveGymInput): Promise<SavedGymView> {
    const preference = AlertPreference.of(input.alertMode, input.alertBelow);
    const branch = (await this.summaries.execute([branchId])).get(branchId);
    if (branch === undefined) throw new BranchNotFoundError(branchId);

    const entry = await this.saved.save(userId, branchId, preference);
    return {
      branch,
      alertMode: entry.alertMode,
      alertBelow: entry.alertBelow,
      savedAt: entry.savedAt,
    };
  }
}
