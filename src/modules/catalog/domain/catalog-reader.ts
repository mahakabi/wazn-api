import { type CatalogBranch, type Gender } from './catalog-types';

export interface NearbyQuery {
  readonly lat: number;
  readonly lng: number;
  readonly radiusMeters: number;
  readonly gender?: Gender;
  readonly limit: number;
}

export interface TextQuery {
  readonly text: string;
  readonly gender?: Gender;
  readonly limit: number;
}

export interface BranchHit {
  readonly branchId: string;
  readonly distanceMeters: number | null;
}

/** Read side of the catalog. Only LISTED and PARTNER gyms are ever returned. */
export interface CatalogReader {
  /** Nearest first. */
  findNearby(query: NearbyQuery): Promise<BranchHit[]>;
  search(query: TextQuery): Promise<BranchHit[]>;
  /** Loads branches with plans and their approved LIVE offers. Unknown ids are skipped. */
  loadBranches(ids: readonly string[]): Promise<CatalogBranch[]>;
}

export const CATALOG_READER = Symbol('CATALOG_READER');
