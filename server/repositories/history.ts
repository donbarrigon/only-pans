import { Collection, ObjectId } from 'mongodb'
import { mongoError, mongoResultError } from '~~/shared/utils/error/error'
import { okVoid, Result } from '~~/shared/utils/error/result'
import { coll } from './collections'
import { Changes } from '../../shared/types/models/history'

export const CREATE_ACTION = 'create'
export const UPDATE_ACTION = 'update'
export const DELETE_ACTION = 'delete'
export const FORCE_DELETE_ACTION = 'delete permanently'

export async function createHistory<T extends Document>(
  collection: Collection<T>,
  userId: ObjectId | undefined,
  action: string,
  changes?: Changes
): Promise<Result<void>> {
  try {
    const result = await coll.history.insertOne({
      _id: undefined,
      collection: collection.collectionName,
      userId,
      action,
      changes,
      deletedAt: new Date(),
    })

    const r = mongoResultError(result)
    if (r.error) {
      return r
    }

    return okVoid
  } catch (e) {
    return mongoError(e)
  }
}
