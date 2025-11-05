import type { ObjectId } from 'mongodb'

export interface IUser {
  _id: ObjectId | undefined
  email: string
  password: string
  profile: {
    name: string
    nickname: string
    avatar: string
    banner: string
    phone: string
  }
  roles: Set<string>
  permissions: Set<string>
  emailVerifiedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
