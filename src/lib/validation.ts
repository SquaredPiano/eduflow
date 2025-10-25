// Validation schemas (placeholder). Consider adding zod in the future.
export function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}
