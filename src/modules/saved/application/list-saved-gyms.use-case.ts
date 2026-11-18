import { Inject, Injectable } from '@nestjs/common';
import { GetBranchSummariesUseCase } from '../../catalog/application/get-branch-summaries.use-case';
import { SAVED_GYM_REPOSITORY, type SavedGymRepository } from '../domain/saved-gym-repository';
import { type SavedGymView } from '../domain/saved-gym-view';

/** Newest first; gyms that were since hidden are left out. */
@Injectable()
export class ListSavedGymsUseCase {
  constructor(
    @Inject(SAVED_GYM_REPOSITORY) private readonly saved: SavedGymRepository,
    private readonly summaries: GetBranchSummariesUseCase,
  ) {}

  async execute(userId: string): Promise<SavedGymView[]> {
    const entries = await this.saved.list(userId);
    const branches = await this.summaries.execute(entries.map((entry) => entry.branchId));
    return entries.flatMap((entry) => {
      const branch = branches.get(entry.branchId);
      return branch
        ? [
            {
              branch,
              alertMode: entry.alertMode,
              alertBelow: entry.alertBelow,
              savedAt: entry.savedAt,
            },
          ]
        : [];
    });
  }
}
