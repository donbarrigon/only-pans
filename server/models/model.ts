import { db } from '~~/utils/db/mongo'

export const coll = {
  user: db.collection('users'),
  role: db.collection('roles'),
  permission: db.collection('permissions'),
}
