import type { ObjectId } from 'mongodb'
import { UserStoreOutput } from '~~/shared/validators/user/UserStore'
import { dbc } from '~~/utils/db/mongo'
import { conflictError, mongoError } from '~~/utils/error/error'

const defaultRoles = new Set<string>(['user'])
const defaultPermissions = new Set<string>([])
const defaultAvatar = ''
const defaultBanner = ''

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
  roles: Set<string>
  permissions: Set<string>
  emailVerifiedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const coll = 'users'

export async function createUser(dto: UserStoreOutput): Promise<User> {
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
    const result = await dbc(coll).insertOne(user)
    user._id = result.insertedId
    return user
  } catch (e) {
    mongoError(e)
  }
}

export async function updateEmail(user: User, email: string): Promise<void> {
  const col = dbc(coll)
  let u
  try {
    u = await col.findOne({ email: email, _id: { $ne: user._id } })
  } catch (e) {
    mongoError(e)
  }
  if (!u) {
    return conflictError('El email ya existe')
  }
  try {
    const result = await col.updateOne({ _id: user._id }, { $set: { email } })
  } catch (e) {
    mongoError(e)
  }
}
