import { ObjectId } from 'mongodb'
import { Token } from '#shared/types/models/token'
import { ok, okVoid, Result } from '~~/shared/utils/error/result'
import { hexToken } from '~~/shared/utils/auth/token'
import { coll } from './collections'
import { mongoError, mongoResultError, unauthorizedError } from '~~/shared/utils/error/error'

export async function newToken(
  userId: ObjectId,
  action: string,
  metadata?: Record<string, string>
): Promise<Result<Token>> {
  try {
    const token: Token = {
      _id: undefined,
      token: hexToken(),
      userId,
      action,
      metadata,
      createdAt: new Date(),
      expiresAt: new Date(),
    }

    const result = await coll.token.insertOne(token)
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }

    return ok(token)
  } catch (e) {
    return mongoError(e)
  }
}

export async function getToken(token: string): Promise<Result<Token>> {
  try {
    const tk = await coll.token.findOne({ token, deletedAt: { $exists: false } })
    if (!tk) {
      return unauthorizedError('El token expiró')
    }

    if (tk.expiresAt < new Date()) {
      const r = await deleteToken(token)
      if (r.error) {
        return unauthorizedError(r.value, 'El token expiró')
      }
      return unauthorizedError('El token expiró')
    }

    return ok(tk)
  } catch (e) {
    return mongoError(e)
  }
}

export async function deleteToken(token: string): Promise<Result<void>> {
  try {
    const result = await coll.token.updateOne({ token }, { $set: { deletedAt: new Date() } })
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }
    return okVoid
  } catch (e) {
    return mongoError(e)
  }
}
