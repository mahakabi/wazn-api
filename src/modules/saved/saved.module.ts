import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { ListSavedGymsUseCase } from './application/list-saved-gyms.use-case';
import { SaveGymUseCase } from './application/save-gym.use-case';
import { UnsaveGymUseCase } from './application/unsave-gym.use-case';
import { SAVED_GYM_REPOSITORY } from './domain/saved-gym-repository';
import { PrismaSavedGymRepository } from './infrastructure/prisma-saved-gym.repository';
import { SavedGymsController } from './presentation/saved-gyms.controller';

@Module({
  imports: [CatalogModule],
  controllers: [SavedGymsController],
  providers: [
    ListSavedGymsUseCase,
    SaveGymUseCase,
    UnsaveGymUseCase,
    { provide: SAVED_GYM_REPOSITORY, useClass: PrismaSavedGymRepository },
  ],
})
export class SavedModule {}
