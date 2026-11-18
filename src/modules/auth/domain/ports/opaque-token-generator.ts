/** High-entropy random tokens (refresh tokens, family ids) and their one-way hash. */
export interface OpaqueTokenGenerator {
  generate(): string;
  hash(token: string): string;
}

export const OPAQUE_TOKEN_GENERATOR = Symbol('OPAQUE_TOKEN_GENERATOR');
