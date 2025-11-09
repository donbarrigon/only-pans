import { UserStore } from '~~/shared/validators/user/UserStore'
import { validateBody } from '~~/utils/validation/json'
import bcrypt from 'bcrypt'
import { createUser } from '~~/server/models/user'
import { sessionStart, getCookieSerializeOptions } from '~~/utils/auth/session'
import { responseError, responseOk } from '~~/utils/response/json'

export default defineEventHandler(async event => {
  const dto = await validateBody(event, UserStore)
  if (dto.error) {
    return responseError(event, dto)
  }
  dto.value.password = await bcrypt.hash(dto.value.password, 10)

  const user = await createUser(dto.value)
  if (user.error) {
    return responseError(event, user)
  }

  const session = await sessionStart(event, user.value)
  if (session.error) {
    return responseError(event, session)
  }

  setCookie(event, 'session', session.value.token, getCookieSerializeOptions())

  return responseOk(event, session.value)
})
