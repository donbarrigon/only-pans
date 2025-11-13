import type { ObjectId } from 'mongodb'

export interface Token {
  _id: ObjectId | undefined
  token: string
  userId: ObjectId
  action: string
  metadata?: Record<string, string>
  createdAt: Date
  expiresAt: Date
  deletedAt?: Date
}
