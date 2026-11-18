import { Inject, Injectable } from '@nestjs/common';
import { SAVED_GYM_REPOSITORY, type SavedGymRepository } from '../domain/saved-gym-repository';

@Injectable()
export class UnsaveGymUseCase {
  constructor(@Inject(SAVED_GYM_REPOSITORY) private readonly saved: SavedGymRepository) {}

  execute(userId: string, branchId: string): Promise<void> {
    return this.saved.remove(userId, branchId);
  }
}
