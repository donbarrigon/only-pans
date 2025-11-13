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
  emailVerifiedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface UserResource {
  _id: ObjectId
  email: string
  profile: {
    name: string
    nickname: string
    avatar: string
    banner: string
    phone: string | null
  }
  roles: string[]
  permissions: string[]
  emailVerifiedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
