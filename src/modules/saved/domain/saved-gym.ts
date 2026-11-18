import { type AlertMode } from './alert-mode';

export interface SavedGym {
  readonly branchId: string;
  readonly alertMode: AlertMode;
  readonly alertBelow: number | null;
  readonly savedAt: Date;
}
