import { type H3Error } from 'h3'

export type Result<T> = Ok<T> | Err

export interface Ok<T> {
  value: T
  error: undefined
}
export interface Err {
  value: undefined
  error: H3Error
}

export const okVoid: Ok<void> = { value: undefined, error: undefined } as const satisfies Ok<void>

export function ok<T>(value: T): Ok<T> {
  return { value, error: undefined }
}

export function err(error: H3Error): Err {
  return { value: undefined, error }
}
