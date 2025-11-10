import { Collection } from 'mongodb'
import { db } from '#shared/utils/db/mongo'
import { Trash } from '#shared/types/models/trash'
import { User } from '#shared/types/models/user'
import { History } from '#shared/types/models/history'
import { Roles } from '#shared/types/models/roles'
import { Permission } from '#shared/types/models/permissions'

export type CollectionType<T> = T extends Collection<infer U> ? U : never

export const coll = {
  user: db.collection<User>('users'),
  role: db.collection<Roles>('roles'),
  permission: db.collection<Permission>('permissions'),
  trash: db.collection<Trash>('trash'),
  history: db.collection<History>('history'),
}
