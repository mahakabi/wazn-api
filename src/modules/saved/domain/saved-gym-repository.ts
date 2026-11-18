import { type AlertPreference } from './alert-preference';
import { type SavedGym } from './saved-gym';

export interface SavedGymRepository {
  list(userId: string): Promise<SavedGym[]>;
  save(userId: string, branchId: string, preference: AlertPreference): Promise<SavedGym>;
  /** Idempotent. */
  remove(userId: string, branchId: string): Promise<void>;
}

export const SAVED_GYM_REPOSITORY = Symbol('SAVED_GYM_REPOSITORY');
