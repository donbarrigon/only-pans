import { coll } from '~~/server/repositories/collections'
import { createHistory, voidChanges } from '~~/server/repositories/history'
import { getToken } from '~~/server/repositories/token'
import { getUserByHexId, updateUserPassword } from '~~/server/repositories/user'
import { sendEmailNewPassword } from '~~/server/service/mail'
import { destroyAllSessions } from '~~/shared/utils/auth/session'
import { randomString } from '~~/shared/utils/auth/token'
import { unauthorizedError } from '~~/shared/utils/error/error'
import { logError } from '~~/shared/utils/log/log'
import { responseError, responseNoContent } from '~~/shared/utils/response/json'

export default defineEventHandler(async event => {
  const user = await getUserByHexId(event.context.params?.id ?? '')
  if (user.error) {
    return responseError(event, user)
  }

  const token = await getToken(event.context.params?.tk ?? '')
  if (token.error) {
    return responseError(event, token)
  }

  if (token.value.action !== 'reset-password') {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  if (token.value.userId.toHexString() !== user.value._id?.toHexString()) {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  const newPassword = randomString()
  const changes = await updateUserPassword(user.value, newPassword)
  if (changes.error) {
    return responseError(event, changes)
  }

  sendEmailNewPassword(user.value, newPassword)
  createHistory(coll.user, token.value.userId, 'reset-password', voidChanges(token.value.userId))

  const ds = await destroyAllSessions(user.value._id!.toHexString())
  if (ds.error) {
    logError('Error al destruir las sesiones', ds.error)
  }

  return responseNoContent(event)
})
