import { ok, okVoid, Result } from '~~/shared/utils/error/result'
import { coll, CollectionType } from './collections'
import { Trash } from '../../shared/types/models/trash'
import { mongoError, mongoResultError, notFoundError } from '~~/shared/utils/error/error'
import { dbc } from '~~/shared/utils/db/mongo'
import { Collection, ObjectId, WithId } from 'mongodb'

export async function moveToTrash<C extends Collection>(
  collection: C,
  document: WithId<CollectionType<C>>
): Promise<Result<void>> {
  try {
    const result = await coll.trash.insertOne({
      _id: undefined,
      collection: collection.collectionName,
      document,
      deletedAt: new Date(),
    } satisfies Trash<CollectionType<C>>)

    const r = mongoResultError(result)
    if (r.error) return r

    const result2 = await collection.deleteOne({ _id: document._id })
    const r2 = mongoResultError(result2)
    if (r2.error) return r2

    return okVoid
  } catch (e) {
    return mongoError(e)
  }
}

export async function recover<C extends Collection>(collection: C, id: string): Promise<Result<CollectionType<C>>> {
  try {
    const oid = ObjectId.createFromHexString(id)

    const trash = await coll.trash.findOne({ _id: oid, collection: collection.collectionName })
    if (!trash) {
      return notFoundError()
    }

    const result = await dbc(trash.collection).insertOne(trash.document)
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }

    const result2 = await coll.trash.deleteOne({ _id: oid })
    const r2 = mongoResultError(result2)
    if (r2.error) {
      return r2
    }

    return ok(trash.document as unknown as CollectionType<C>)
  } catch (e) {
    return mongoError(e)
  }
}
