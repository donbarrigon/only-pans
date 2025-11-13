import { UserStore } from '~~/shared/validators/user/UserStore'
import { validateBody } from '~~/shared/utils/validation/json'
import { createUser } from '~~/server/repositories/user'
import { sessionStart, getCookieSerializeOptionsForSession } from '~~/shared/utils/auth/session'
import { responseError, responseOk } from '~~/shared/utils/response/json'
import { CREATE_ACTION, createHistory, voidChanges } from '~~/server/repositories/history'
import { coll } from '~~/server/repositories/collections'
import { sendEmailVerfification } from '~~/server/service/mail'

export default defineEventHandler(async event => {
  const dto = await validateBody(event, UserStore)
  if (dto.error) {
    return responseError(event, dto)
  }

  const user = await createUser(dto.value)
  if (user.error) {
    return responseError(event, user)
  }

  const session = await sessionStart(event, user.value)
  if (session.error) {
    return responseError(event, session)
  }

  setCookie(event, 'session', session.value.token, getCookieSerializeOptionsForSession())
  sendEmailVerfification(user.value)
  createHistory(coll.user, user.value._id, CREATE_ACTION, voidChanges(user.value._id!))

  return responseOk(event, session.value)
})
