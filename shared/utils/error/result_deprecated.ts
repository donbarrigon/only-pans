import { type H3Error } from 'h3'

export type Result<T> = Ok<T> | Err

export interface Ok<T> {
  hasError: false
  value: T
}
export interface Err {
  hasError: true
  error: H3Error
}

export const okVoid: Ok<void> = { hasError: false, value: undefined } as const satisfies Ok<void>
// export const okVoid: Readonly<Ok<void>> = { hasError: false, value: undefined }

export function ok<T>(value: T): Ok<T> {
  return { hasError: false, value }
}

export function err(error: H3Error): Err {
  return { hasError: true, error }
}
