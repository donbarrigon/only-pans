import type { H3Event } from 'h3'
import { getRequestIP, getRequestHeader } from 'h3'
import { hexToken } from './token'
import { decode, encode } from '@msgpack/msgpack'
import { forbiddenError, internalError, unauthorizedError } from '../error/error'
import { extensionCodec } from '../fetch/extensionCodec'
import { ObjectId } from 'mongodb'

export interface ISessionUser {
  _id: ObjectId | undefined
  roles: Set<string>
  permissions: Set<string>
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

export async function sessionStart(event: H3Event, user: ISessionUser): Promise<Session> {
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

  await saveSession(session)
  return session
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

export async function saveSession(session: Session): Promise<void> {
  session.expiresAt = new Date(Date.now() + sessionLife)
  await saveToken(session)
  await saveIndex(session)
}

async function saveToken(session: Session): Promise<void> {
  const encoded = encode(session, { extensionCodec })
  const filePath = tokenFilePath(session.token)
  try {
    await Bun.write(filePath, encoded)
  } catch (e) {
    internalError(e, 'No pudimos crear tu sesión')
  }
}

async function saveIndex(session: Session): Promise<void> {
  if (!session.user._id) {
    internalError('El usuario no tiene id')
  }
  const tokens = await getUserTokens(session.user._id.toHexString())
  if (!tokens.includes(session.token)) {
    tokens.push(session.token)
  }
  const filePath = userFilePath(session.user._id.toHexString())
  const encoded = encode(tokens)
  try {
    await Bun.write(filePath, encoded)
  } catch (e) {
    internalError(e, `No se creó la sesión ${session.token}`)
  }
}

export async function getUserTokens(userId: string): Promise<string[]> {
  const filePath = userFilePath(userId)
  try {
    const file = Bun.file(filePath)
    if (!(await file.exists())) {
      return []
    }
    const buffer = await file.bytes()
    const decoded = decode(buffer) as string[]
    return decoded
  } catch (e) {
    internalError(e, 'No fue posible obtener las sesiones del usuario')
  }
}

export async function getSession(id: string): Promise<Session> {
  const filePath = tokenFilePath(id)
  const file = Bun.file(filePath)

  if (!(await file.exists())) {
    unauthorizedError('La sesión ha expirado, por favor inicia sesión nuevamente')
  }

  let buffer: Uint8Array
  let decoded: Session

  try {
    buffer = await file.bytes()
    decoded = decode(buffer, { extensionCodec }) as Session
  } catch (e) {
    console.error(e)
    await file.unlink()
    unauthorizedError('La sesión ha expirado, por favor inicia sesión nuevamente')
  }

  if (decoded.expiresAt < new Date()) {
    await file.unlink()
    unauthorizedError('La sesión ha expirado, por favor inicia sesión nuevamente')
  }

  await saveSession(decoded)
  return decoded
}

export async function destroySession(session: Session): Promise<void> {
  if (!session.user._id) {
    internalError('El usuario de la sesión no tiene id')
  }
  const filePath = tokenFilePath(session.token)

  await removeIndex(session.token, session.user._id.toHexString())
  try {
    const file = Bun.file(filePath)
    if (await file.exists()) {
      await file.unlink()
    }
  } catch (e) {
    internalError(e, `Hubo un problema al cerrar la sesión`)
  }
}

async function removeIndex(token: string, userId: string): Promise<void> {
  const tokens = await getUserTokens(userId)
  const index = tokens.indexOf(token)
  if (index > -1) {
    tokens.splice(index, 1)
    const filePath = userFilePath(userId)
    const encoded = encode(tokens)
    try {
      await Bun.write(filePath, encoded)
    } catch (e) {
      internalError(e, `Hubo un problema al remover el índice de la sesión`)
    }
  }
}

export function can(session: Session, permission: string): void {
  if (!session.user.permissions.has(permission)) {
    forbiddenError()
  }
}

export function canAny(session: Session, permissions: string[]): void {
  for (const permission of permissions) {
    if (session.user.permissions.has(permission)) {
      return
    }
  }
  forbiddenError()
}

export function hasRole(session: Session, role: string): void {
  if (!session.user.roles.has(role)) {
    forbiddenError()
  }
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

export function getCookieSerializeOptions(): CookieSerializeOptions {
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
