import { UserStore } from '~~/shared/validators/user/UserStore'
import { validateBody } from '~~/shared/utils/validation/json'
import { createUser } from '~~/server/repositories/user'
import { sessionStart, getCookieSerializeOptionsForSession } from '~~/shared/utils/auth/session'
import { responseError, responseOk } from '~~/shared/utils/response/json'
import { hashPasswordService } from '~~/server/service/user'
import { CREATE_ACTION, createHistory } from '~~/server/repositories/history'
import { coll } from '~~/server/repositories/collections'

export default defineEventHandler(async event => {
  const dto = await validateBody(event, UserStore)
  if (dto.error) {
    return responseError(event, dto)
  }

  const hp = await hashPasswordService(dto.value.password)
  if (hp.error) {
    return responseError(event, hp)
  }
  dto.value.password = hp.value

  const user = await createUser(dto.value)
  if (user.error) {
    return responseError(event, user)
  }

  const session = await sessionStart(event, user.value)
  if (session.error) {
    return responseError(event, session)
  }

  setCookie(event, 'session', session.value.token, getCookieSerializeOptionsForSession())

  createHistory(coll.user, user.value._id, CREATE_ACTION)

  return responseOk(event, session.value)
})
