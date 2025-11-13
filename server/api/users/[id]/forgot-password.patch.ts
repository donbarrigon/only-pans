import { create } from 'domain'
import { coll } from '~~/server/repositories/collections'
import { createHistory, voidChanges } from '~~/server/repositories/history'
import { getUserByHexId } from '~~/server/repositories/user'
import { sendEmailForgotPassword } from '~~/server/service/mail'
import { responseError, responseNoContent } from '~~/shared/utils/response/json'

export default defineEventHandler(async event => {
  const id = event.context.params?.id ?? ''
  const user = await getUserByHexId(id)
  if (user.error) {
    return responseError(event, user)
  }

  sendEmailForgotPassword(user.value)
  createHistory(coll.user, user.value._id!, 'forgot-password', voidChanges(user.value._id!))

  return responseNoContent(event)
})
