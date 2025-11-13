import { ObjectId } from 'mongodb'

export interface History {
  _id: ObjectId | undefined
  collection: string
  userId: ObjectId | undefined
  action: string
  changes?: Changes
  deletedAt: Date
}

export type Changes = {
  _id: ObjectId
  old?: Record<string, any>
  new?: Record<string, any>
}
