import { ObjectId } from 'mongodb'

export interface Roles {
  _id: ObjectId | undefined
  name: string
  permissions: string[]
}
