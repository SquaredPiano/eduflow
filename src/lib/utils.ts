import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
export const assert = (cond: unknown, message = 'Assertion failed'): asserts cond => {
  if (!cond) throw new Error(message)
}
