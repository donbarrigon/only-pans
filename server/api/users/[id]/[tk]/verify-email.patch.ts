import { coll } from '~~/server/repositories/collections'
import { createHistory, voidChanges } from '~~/server/repositories/history'
import { getToken } from '~~/server/repositories/token'
import { getUserByHexId, verifyUserEmail } from '~~/server/repositories/user'
import { unauthorizedError } from '~~/shared/utils/error/error'
import { responseError, responseNoContent } from '~~/shared/utils/response/json'

export default defineEventHandler(async event => {
  const id = event.context.params?.id ?? ''
  const user = await getUserByHexId(id)
  if (user.error) {
    return responseError(event, user)
  }

  const tk = event.context.params?.tk ?? ''
  const token = await getToken(tk)
  if (token.error) {
    return responseError(event, token)
  }

  if (token.value.action !== 'verify-email') {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  if (token.value.userId.toHexString() !== user.value._id?.toHexString()) {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  const r = await verifyUserEmail(user.value)
  if (r.error) {
    return r
  }

  createHistory(coll.user, user.value._id, 'verify-email', voidChanges(user.value._id!))

  return responseNoContent(event)
})
