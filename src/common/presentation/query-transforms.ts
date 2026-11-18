import { type TransformFnParams } from 'class-transformer';

/** Query strings arrive as text: "true"/"1" → true, "false"/"0" → false, anything else unchanged. */
export function toBoolean({ value }: TransformFnParams): unknown {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
}

/** "a,b,c" → ["a","b","c"] (empty parts dropped). */
export function toStringList({ value }: TransformFnParams): unknown {
  return typeof value === 'string'
    ? value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
    : value;
}
