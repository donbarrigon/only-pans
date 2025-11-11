import { UserStoreOutput } from '#shared/validators/user/UserStore'
import { ok, okVoid, Result } from '#shared/utils/error/result'
import { createUnprocessableEntityError, mongoError, mongoResultError } from '#shared/utils/error/error'
import { coll } from './collections'
import { User } from '#shared/types/models/user'
import { QueryFindOptions, setQueryFindOptions } from '#shared/utils/db/filterFindOptions'

const defaultRoles: string[] = ['user']
const defaultPermissions: string[] = []
const defaultAvatar: string = ''
const defaultBanner: string = ''

export async function UserGetAll(options: QueryFindOptions): Promise<Result<User[]>> {
  try {
    const cursor = coll.user.find()
    setQueryFindOptions(cursor, options)
    return ok(await cursor.toArray())
  } catch (e) {
    return mongoError(e)
  }
}

export async function createUser(dto: UserStoreOutput): Promise<Result<User>> {
  try {
    const u = await coll.user.findOne({
      $or: [{ email: dto.email }, { 'profile.nickname': dto.nickname }],
    })
    if (u) {
      if (u.email === dto.email) {
        return createUnprocessableEntityError('email', 'El email ya existe')
      }
      if (u.profile.nickname === dto.nickname) {
        return createUnprocessableEntityError('nickname', 'El nickname ya existe')
      }
      return createUnprocessableEntityError([
        { field: 'email', message: 'El email o nickname ya estan registrados' },
        { field: 'nickname', message: 'El email o nickname ya estan registrados' },
      ])
    }

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

export async function updateUserEmail(user: User, email: string): Promise<Result<void>> {
  try {
    const u = await coll.user.findOne({ email: email, _id: { $ne: user._id } })
    if (u) {
      return createUnprocessableEntityError('email', 'El email ya esta registrado')
    }

    const updatedAt = new Date()
    const result = await coll.user.updateOne({ _id: user._id }, { $set: { email, updatedAt } })
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }

    user.email = email
    user.updatedAt = updatedAt
    return okVoid
  } catch (e) {
    return mongoError(e)
  }
}

export async function updateUserPassword(user: User, password: string): Promise<Result<void>> {
  const updatedAt = new Date()
  const result = await coll.user.updateOne({ _id: user._id }, { $set: { password, updatedAt } })
  const r = mongoResultError(result)
  if (r.error) {
    return r
  }

  user.password = password
  user.updatedAt = updatedAt
  return okVoid
}

export async function updateUserProfile(user: User, dto: UserStoreOutput): Promise<Result<void>> {
  return okVoid
}
