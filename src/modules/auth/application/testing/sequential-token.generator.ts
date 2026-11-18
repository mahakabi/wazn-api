import { type OpaqueTokenGenerator } from '../../domain/ports/opaque-token-generator';

export class SequentialTokenGenerator implements OpaqueTokenGenerator {
  private counter = 0;

  generate(): string {
    this.counter += 1;
    return `token_${this.counter}`;
  }

  hash(token: string): string {
    return `hash(${token})`;
  }
}
