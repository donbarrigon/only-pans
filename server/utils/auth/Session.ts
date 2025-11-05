import type { IUser } from '../../models/User'
import type { H3Event } from 'h3'
import { hexToken } from './token'
import { decode, encode, ExtensionCodec } from '@msgpack/msgpack'
import { internalError, unauthorizedError } from '../error/error'
import { ObjectId } from 'mongodb'

export type Session = {
  token: string
  user: IUser
  ip: string
  agent: string
  lang: string
  fingerprint: string
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

const extensionCodec = new ExtensionCodec()

// Registrar manejo de fechas (tipo 0)
extensionCodec.register({
  type: 0,
  encode: (input: unknown) => {
    if (input instanceof Date) {
      const buffer = new ArrayBuffer(8)
      const view = new DataView(buffer)
      view.setFloat64(0, input.getTime())
      return new Uint8Array(buffer)
    }
    return null
  },
  decode: (data: Uint8Array) => {
    const view = new DataView(data.buffer)
    const timestamp = view.getFloat64(0)
    return new Date(timestamp)
  },
})

// Registrar manejo de ObjectId (tipo 1)
extensionCodec.register({
  type: 1,
  encode: (input: unknown) => {
    if (input instanceof ObjectId) {
      // Convertir a string hexadecimal (24 caracteres)
      const hexString = input.toHexString()
      return new TextEncoder().encode(hexString)
    }
    return null
  },
  decode: (data: Uint8Array) => {
    // Reconstruir ObjectId desde el string
    const hexString = new TextDecoder().decode(data)
    return new ObjectId(hexString)
  },
})

// Registrar manejo de Sets (tipo 2)
extensionCodec.register({
  type: 2,
  encode: (input: unknown) => {
    if (input instanceof Set) {
      // Convertir el Set a array y codificarlo
      const array = Array.from(input)
      return encode(array, { extensionCodec })
    }
    return null
  },
  decode: (data: Uint8Array) => {
    // Decodificar el array y convertirlo de vuelta a Set
    const array = decode(data, { extensionCodec }) as unknown[]
    return new Set(array)
  },
})

export async function sessionStart(event: H3Event, user: IUser): Promise<Session> {
  const ip = getRequestIP(event) || 'unknown'
  const agent = getRequestHeader(event, 'user-agent') || 'unknown'
  const lang = getRequestHeader(event, 'accept-language') || 'unknown'
  const fingerprint = getRequestHeader(event, 'x-fingerprint') || 'unknown'

  const session: Session = {
    token: hexToken(),
    user,
    ip,
    agent,
    lang,
    fingerprint,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
  }

  await saveSession(session)
  return session
}

export async function saveSession(session: Session): Promise<void> {
  const config = useRuntimeConfig()
  session.expiresAt = new Date(Date.now() + config.sessionLife)
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
