import { UserStoreOutput } from '#shared/validators/user/UserStore'
import { UserUpdateProfileOutput } from '#shared/validators/user/UserUpdateProfile'
import { ok, okVoid, type Result } from '#shared/utils/error/result'
import { createUnprocessableEntityError, mongoError, mongoResultError, notFoundError } from '#shared/utils/error/error'
import { coll } from './collections'
import { User } from '#shared/types/models/user'
import { QueryFindOptions, setQueryFindOptions } from '#shared/utils/db/mongo'
import { ObjectId } from 'mongodb'
import { Changes } from '~~/shared/types/models/history'

const defaultRoles: string[] = ['user']
const defaultPermissions: string[] = []
const defaultAvatar: string = ''
const defaultBanner: string = ''

export async function getAllUsers(options: QueryFindOptions): Promise<Result<User[]>> {
  try {
    const cursor = coll.user.find()
    setQueryFindOptions(cursor, options)
    return ok(await cursor.toArray())
  } catch (e) {
    return mongoError(e)
  }
}

export async function getUserByHexId(id: string): Promise<Result<User>> {
  try {
    const oid = ObjectId.createFromHexString(id)
    const user = await coll.user.findOne({ _id: oid })
    if (!user) {
      return notFoundError('No se encontro el usuario')
    }
    return ok(user)
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

export async function updateUserEmail(user: User, email: string): Promise<Result<Changes>> {
  try {
    if (user.email === email) {
      return createUnprocessableEntityError('email', 'El email ya esta registrado')
    }
    const u = await coll.user.findOne({ email: email, _id: { $ne: user._id } })
    if (u) {
      return createUnprocessableEntityError('email', 'El email ya esta registrado')
    }

    const changes: Changes = {
      _id: user._id!,
      old: {
        email: user.email,
      },
      new: {
        email: email,
      },
    }

    const updatedAt = new Date()
    const result = await coll.user.updateOne({ _id: user._id }, { $set: { email, updatedAt } })
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }

    user.email = email
    user.updatedAt = updatedAt
    return ok(changes)
  } catch (e) {
    return mongoError(e)
  }
}

export async function updateUserPassword(user: User, hashPassword: string): Promise<Result<void>> {
  const updatedAt = new Date()
  const result = await coll.user.updateOne({ _id: user._id }, { $set: { password: hashPassword, updatedAt } })
  const r = mongoResultError(result)
  if (r.error) {
    return r
  }

  user.password = hashPassword
  user.updatedAt = updatedAt
  return okVoid
}

export async function updateUserProfile(user: User, dto: UserUpdateProfileOutput): Promise<Result<Changes>> {
  try {
    const u = await coll.user.findOne({ 'profile.nickname': user.profile.nickname, _id: { $ne: user._id } })
    if (u) {
      return createUnprocessableEntityError('nickname', 'El nickname ya esta registrado')
    }

    const changes: Changes = {
      _id: user._id!,
      old: {},
      new: {},
    }

    if (user.profile.name !== dto.name) {
      changes.old.name = user.profile.name
      changes.new.name = dto.name
      user.profile.name = dto.name
    }

    if (user.profile.nickname !== dto.nickname) {
      changes.old.nickname = user.profile.nickname
      changes.new.nickname = dto.nickname
      user.profile.nickname = dto.nickname
    }

    if (user.profile.phone !== dto.phone) {
      changes.old.phone = user.profile.phone
      changes.new.phone = dto.phone
      user.profile.phone = dto.phone
    }

    const updatedAt = new Date()

    const result = await coll.user.updateOne({ _id: user._id }, { $set: { profile: user.profile, updatedAt } })
    const r = mongoResultError(result)
    if (r.error) {
      return r
    }

    return ok(changes)
  } catch (e) {
    return mongoError(e)
  }
}
