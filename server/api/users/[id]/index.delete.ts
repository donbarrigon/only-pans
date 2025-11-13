import { create } from 'domain'
import { userDeletePolicy } from '~~/server/policies/user'
import { coll } from '~~/server/repositories/collections'
import { createHistory, DELETE_ACTION, voidChanges } from '~~/server/repositories/history'
import { deleteUser } from '~~/server/repositories/user'
import { responseError, responseNoContent } from '~~/shared/utils/response/json'

export default defineEventHandler(async event => {
  const session = await userDeletePolicy(event)
  if (session.error) {
    return responseError(event, session)
  }

  const ud = await deleteUser(event.context.params!.id)
  if (ud.error) {
    return responseError(event, ud)
  }

  createHistory(coll.user, session.value.user._id, DELETE_ACTION, voidChanges(ud.value))

  return responseNoContent(event)
})
