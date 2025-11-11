import { ObjectId, type WithId } from 'mongodb'

export interface Trash<T extends Document = Document> {
  _id: ObjectId | undefined
  collection: string
  document: WithId<T>
  deletedAt: Date
}
