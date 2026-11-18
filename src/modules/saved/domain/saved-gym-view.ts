import { type BranchSummary } from '../../catalog/domain/branch-views';
import { type AlertMode } from './alert-mode';

export interface SavedGymView {
  readonly branch: BranchSummary;
  readonly alertMode: AlertMode;
  readonly alertBelow: number | null;
  readonly savedAt: Date;
}
