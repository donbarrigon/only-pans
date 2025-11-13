import { coll } from '~~/server/repositories/collections'
import { createHistory } from '~~/server/repositories/history'
import { getToken } from '~~/server/repositories/token'
import { getUserByHexId, updateUserEmail } from '~~/server/repositories/user'
import { sendEmailVerfification } from '~~/server/service/mail'
import { destroyAllSessions } from '~~/shared/utils/auth/session'
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

  if (token.value.action !== 'change-email-revert') {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  if (!token.value.metadata) {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  if (token.value.metadata.oldEmail !== user.value.email && token.value.metadata.newEmail === user.value.email) {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  if (token.value.userId.toHexString() !== user.value._id?.toHexString()) {
    return responseError(event, unauthorizedError('El token es incorrecto'))
  }

  const changes = await updateUserEmail(user.value, token.value.metadata.oldEmail)
  if (changes.error) {
    return responseError(event, changes)
  }

  sendEmailVerfification(user.value)
  createHistory(coll.user, token.value.userId, 'change-email-revert', changes.value)
  const rs = await destroyAllSessions(user.value._id!.toHexString())
  if (rs.error) {
    logError('Error al destruir las sesiones', rs.error)
  }

  return responseNoContent(event)
})
