export type ApiResponse<T = unknown> = { ok: true } & T
export type ApiErrorResponse = { ok: false; error: string }
