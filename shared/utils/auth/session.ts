import type { H3Event } from 'h3'
import { getRequestIP, getRequestHeader } from 'h3'
import { hexToken } from './token'
import { decode, encode } from '@msgpack/msgpack'
import { file, write } from 'bun'
import { forbiddenError, internalError, unauthorizedError } from '../error/error'
import { extensionCodec } from '../fetch/extensionCodec'
import { ObjectId } from 'mongodb'
import { ok, okVoid, type Result } from '../error/result'

export interface ISessionUser {
  _id: ObjectId | undefined
  roles: string[]
  permissions: string[]
}

export type Session = {
  token: string
  user: ISessionUser
  ip: string
  agent: string
  lang: string
  referer: string
  fingerprint: string
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

// ================================================================
//                     ENVIRONMENT VARIABLES
// ================================================================

const sessionLife = process.env.SESSION_LIFE ? Number(process.env.SESSION_LIFE) : 1000 * 60 * 60 * 24
const secure = process.env.NODE_ENV === 'production'

// ================================================================
//                      FUNCION DE LA SESSION
// ================================================================

export async function sessionStart(event: H3Event, user: ISessionUser): Promise<Result<Session>> {
  const sh = sessionHeaders(event)

  const session: Session = {
    token: hexToken(),
    user,
    ip: sh.ip,
    agent: sh.agent,
    lang: sh.lang,
    referer: sh.referer,
    fingerprint: sh.fingerprint,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
  }

  const r = await saveSession(session)
  if (r.error) {
    return r
  }
  return ok(session)
}

export function sessionHeaders(event: H3Event): {
  ip: string
  agent: string
  lang: string
  referer: string
  fingerprint: string
} {
  const ip = getRequestIP(event) || 'unknown'
  const agent = getRequestHeader(event, 'user-agent') || 'unknown'
  const lang = getRequestHeader(event, 'accept-language') || 'unknown'
  const fingerprint = getRequestHeader(event, 'x-fingerprint') || 'unknown'
  const referer = getRequestHeader(event, 'referer') || 'unknown'
  return {
    ip,
    agent,
    lang,
    referer,
    fingerprint,
  }
}

export async function saveSession(session: Session): Promise<Result<void>> {
  session.expiresAt = new Date(Date.now() + sessionLife)
  await saveToken(session)
  await saveIndex(session)
  return okVoid
}

async function saveToken(session: Session): Promise<Result<void>> {
  const encoded = encode(session, { extensionCodec })
  const filePath = tokenFilePath(session.token)
  try {
    await write(filePath, encoded)
    return okVoid
  } catch (e) {
    return internalError(e, 'No pudimos crear tu sesión')
  }
}

async function saveIndex(session: Session): Promise<Result<void>> {
  if (!session.user._id) {
    return internalError('El usuario no tiene id')
  }
  const tokens = await getUserTokens(session.user._id.toHexString())
  if (tokens.error) {
    return tokens
  }
  if (!tokens.value.includes(session.token)) {
    tokens.value.push(session.token)
  }

  const filePath = userFilePath(session.user._id.toHexString())

  try {
    const encoded = encode(tokens)
    await write(filePath, encoded)
    return okVoid
  } catch (e) {
    return internalError(e, `No se creó la sessión ${session.token}`)
  }
}

export async function getUserTokens(userId: string): Promise<Result<string[]>> {
  const filePath = userFilePath(userId)
  try {
    const f = file(filePath)
    if (!(await f.exists())) {
      return ok([])
    }
    const buffer = await f.bytes()
    const decoded = decode(buffer) as string[]
    return ok(decoded)
  } catch (e) {
    return internalError(e, 'No fue posible obtener las sesiones del usuario')
  }
}

export async function getSession(id: string): Promise<Result<Session>> {
  const filePath = tokenFilePath(id)
  const f = file(filePath)

  if (!(await f.exists())) {
    return unauthorizedError('La sesión ha expirado, por favor inicia sesión nuevamente')
  }

  let buffer: Uint8Array
  let decoded: Session

  try {
    buffer = await f.bytes()
    decoded = decode(buffer, { extensionCodec }) as Session
  } catch (e) {
    await f.unlink()
    return unauthorizedError('La sesión ha expirado, por favor inicia sesión nuevamente')
  }

  if (decoded.expiresAt < new Date()) {
    await f.unlink()
    return unauthorizedError('La sesión ha expirado, por favor inicia sesión nuevamente')
  }

  const r = await saveSession(decoded)
  if (r.error) {
    return r
  }
  return ok(decoded)
}

export async function destroySession(session: Session): Promise<Result<void>> {
  if (!session.user._id) {
    return internalError('El usuario de la sesión no tiene id')
  }
  const filePath = tokenFilePath(session.token)

  const r = await removeIndex(session.token, session.user._id.toHexString())
  if (r.error) {
    return r
  }
  try {
    const f = file(filePath)
    if (await f.exists()) {
      await f.unlink()
    }
    return okVoid
  } catch (e) {
    return internalError(e, `Hubo un problema al cerrar la sesión`)
  }
}

async function removeIndex(token: string, userId: string): Promise<Result<void>> {
  const tokens = await getUserTokens(userId)
  if (tokens.error) {
    return tokens
  }
  const index = tokens.value.indexOf(token)
  if (index > -1) {
    tokens.value.splice(index, 1)
    const filePath = userFilePath(userId)
    try {
      const encoded = encode(tokens)
      await write(filePath, encoded)
    } catch (e) {
      return internalError(e, `Hubo un problema al remover el índice de la sesión`)
    }
  }
  return okVoid
}

export function can(session: Session, permission: string): Result<void> {
  if (session.user.permissions.includes(permission)) {
    return okVoid
  }
  return forbiddenError()
}

export function canAny(session: Session, permissions: string[]): Result<void> {
  for (const permission of permissions) {
    if (session.user.permissions.includes(permission)) {
      return okVoid
    }
  }
  return forbiddenError()
}

export function hasRole(session: Session, role: string): Result<void> {
  if (session.user.roles.includes(role)) {
    return okVoid
  }
  return forbiddenError()
}

// esta es una copia de un tipo de h3 que no se puede importar
interface CookieSerializeOptions {
  domain?: string
  encode?(value: string): string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  priority?: 'low' | 'medium' | 'high'
  sameSite?: true | false | 'lax' | 'strict' | 'none'
  secure?: boolean
}

export function getCookieSerializeOptionsForSession(): CookieSerializeOptions {
  return {
    httpOnly: true,
    secure: secure,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionLife,
  }
}

function tokenFilePath(token: string): string {
  const dir1 = token.slice(0, 3)
  const dir2 = token.slice(3, 6)
  const fileName = token.slice(6)
  return `tmp/sessions/${dir1}/${dir2}/${fileName}`
}

function userFilePath(id: string): string {
  const dir1 = id.slice(0, 4)
  const dir2 = id.slice(4, 8)
  const fileName = id.slice(8)
  return `tmp/sessions/index/${dir1}/${dir2}/${fileName}`
}
