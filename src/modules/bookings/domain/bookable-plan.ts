import { type CatalogPlan, type GymStatus } from '../../catalog/domain/catalog-types';
import { type BookingPlace } from './booking-record';

export interface BookablePlan {
  readonly plan: CatalogPlan;
  readonly gymStatus: GymStatus;
  readonly place: BookingPlace;
}
