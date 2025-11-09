import { ok, okVoid, Result } from '~~/utils/error/result'
import { coll } from './model'
import { Collection, ObjectId, WithId } from 'mongodb'
import { mongoError, mongoResultError, notFoundError } from '~~/utils/error/error'
import { dbc } from '~~/utils/db/mongo'

export interface Trash<T extends Document = Document> {
  _id: ObjectId | undefined
  collection: string
  document: WithId<T>
  deletedAt: Date
}

type CollectionType<T> = T extends Collection<infer U> ? U : never

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
