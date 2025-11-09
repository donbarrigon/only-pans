import { db } from '~~/utils/db/mongo'
import { Trash } from './trash'
import { User } from './user'

export const coll = {
  user: db.collection<User>('users'),
  // role: db.collection('roles'),
  // permission: db.collection('permissions'),
  trash: db.collection<Trash>('trash'),
  // history: db.collection('history'),
}
