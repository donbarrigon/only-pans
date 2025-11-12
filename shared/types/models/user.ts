import type { ObjectId } from 'mongodb'

export interface User {
  _id: ObjectId | undefined
  email: string
  password: string
  profile: {
    name: string
    nickname: string
    avatar: string
    banner: string
    phone: string | null
  }
  roles: string[]
  permissions: string[]
  emailVerifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
