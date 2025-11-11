import { ObjectId } from 'mongodb'
import { Token } from '#shared/types/models/token'
import { ok, Result } from '~~/shared/utils/error/result'
import { hexToken } from '~~/shared/utils/auth/token'
import { coll } from './collections'
import { mongoError, mongoResultError } from '~~/shared/utils/error/error'

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
