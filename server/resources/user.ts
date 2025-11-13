import type { User, UserResource } from '../../shared/types/models/user'

export function newUserResource(user: User): UserResource {
  return {
    _id: user._id!,
    email: user.email,
    profile: user.profile,
    roles: user.roles,
    permissions: user.permissions,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  }
}

export function newUserCollection(users: User[]): UserResource[] {
  const l = users.length
  const r = new Array<UserResource>(l)
  for (let i = 0; i < l; i++) {
    r[i] = newUserResource(users[i])
  }
  return r
}
