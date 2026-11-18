import { Inject, Injectable } from '@nestjs/common';
import { type BranchFilter } from '../domain/branch-filter';
import { type BranchSummary } from '../domain/branch-views';
import { CATALOG_READER, type CatalogReader } from '../domain/catalog-reader';
import { type Gender } from '../domain/catalog-types';
import { summariesForHits } from './branch-summaries';
import { CANDIDATE_MULTIPLIER } from './catalog-limits';
import { ViewContextProvider } from './view-context.provider';

export interface SearchBranchesInput extends BranchFilter {
  readonly text: string;
  readonly gender?: Gender;
  readonly limit: number;
}

/** Matches gym names (English or Arabic) and districts. */
@Injectable()
export class SearchBranchesUseCase {
  constructor(
    @Inject(CATALOG_READER) private readonly reader: CatalogReader,
    private readonly contexts: ViewContextProvider,
  ) {}

  async execute(input: SearchBranchesInput): Promise<BranchSummary[]> {
    const hits = await this.reader.search({
      text: input.text.trim(),
      gender: input.gender,
      limit: input.limit * CANDIDATE_MULTIPLIER,
    });
    return summariesForHits(this.reader, hits, await this.contexts.current(), input, input.limit);
  }
}
