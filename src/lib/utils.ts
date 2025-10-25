export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
export const assert = (cond: unknown, message = 'Assertion failed'): asserts cond => {
  if (!cond) throw new Error(message)
}
