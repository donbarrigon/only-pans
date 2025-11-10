import { Permission } from '#shared/types/models/permissions'
import { ok, Result } from '#shared/utils/error/result'
import { mongoError } from '#shared/utils/error/error'
import { QueryFindOptions, setQueryFindOptions } from '#shared/utils/db/filterFindOptions'
import { coll } from './collections'

export async function PermissionGetAll(options: QueryFindOptions): Promise<Result<Permission[]>> {
  try {
    const cursor = coll.permission.find()
    setQueryFindOptions(cursor, options)
    return ok(await cursor.toArray())
  } catch (e) {
    return mongoError(e)
  }
}
