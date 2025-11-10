import { ObjectId } from 'mongodb'

export interface Permission {
  _id: ObjectId | undefined
  name: string
}
