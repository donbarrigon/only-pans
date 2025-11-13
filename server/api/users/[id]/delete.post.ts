import { userDeletePolicy } from '~~/server/policies/user'
import { coll } from '~~/server/repositories/collections'
import { createHistory, DELETE_ACTION, voidChanges } from '~~/server/repositories/history'
import { deleteUser, getUserByHexId } from '~~/server/repositories/user'
import { destroyAllSessions } from '~~/shared/utils/auth/session'
import { responseError, responseNoContent } from '~~/shared/utils/response/json'

export default defineEventHandler(async event => {
  const session = await userDeletePolicy(event)
  if (session.error) {
    return responseError(event, session)
  }
  const id = event.context.params?.id ?? ''
  const user = await getUserByHexId(id)
  if (user.error) {
    return responseError(event, user)
  }

  const deleted = await deleteUser(user.value._id!)
  if (deleted.error) {
    return responseError(event, deleted)
  }

  const ds = await destroyAllSessions(user.value._id!.toHexString())
  if (ds.error) {
    return responseError(event, ds)
  }

  createHistory(coll.user, session.value.user._id, DELETE_ACTION, voidChanges(user.value._id!))

  return responseNoContent(event)
})
