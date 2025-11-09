import type { ObjectId } from 'mongodb'
import { UserStoreOutput } from '~~/shared/validators/user/UserStore'
import { ok, okVoid, Result } from '~~/utils/error/result'
import { conflictError, mongoError, mongoResultError } from '~~/utils/error/error'
import { coll } from '~~/server/models/model'

const defaultRoles: string[] = ['user']
const defaultPermissions: string[] = []
const defaultAvatar: string = ''
const defaultBanner: string = ''

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

export async function createUser(dto: UserStoreOutput): Promise<Result<User>> {
  const user: User = {
    _id: undefined,
    email: dto.email,
    password: dto.password,
    profile: {
      name: dto.name,
      nickname: dto.nickname,
      avatar: defaultAvatar,
      banner: defaultBanner,
      phone: dto.phone,
    },
    roles: defaultRoles,
    permissions: defaultPermissions,
    emailVerifiedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }

  try {
    const result = await coll.user.insertOne(user)
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }
    user._id = result.insertedId
    return ok(user)
  } catch (e) {
    return mongoError(e)
  }
}

export async function updateEmail(user: User, email: string): Promise<Result<void>> {
  let u
  try {
    u = await coll.user.findOne({ email: email, _id: { $ne: user._id } })
    if (!u) {
      return conflictError('El email ya existe')
    }
    const updatedAt = new Date()
    const result = await coll.user.updateOne({ _id: user._id }, { $set: { email, updatedAt } })
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }
    user.email = email
    user.updatedAt = updatedAt
  } catch (e) {
    return mongoError(e)
  }
  return okVoid
}
