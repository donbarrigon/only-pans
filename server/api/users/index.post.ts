import { UserStore } from '~~/shared/validators/user/UserStore'
import { validateBody } from '~~/utils_old/validation/json'
import bcrypt from 'bcrypt'
import { createUser } from '~~/server/models/User'
import { type Session, sessionStart, getCookieSerializeOptions } from '~~/utils_old/auth/session'

export default defineEventHandler(async (event): Promise<Session> => {
  const dto = await validateBody(event, UserStore)
  dto.password = await bcrypt.hash(dto.password, 10)
  const user = await createUser(dto)
  const session = await sessionStart(event, user)
  setCookie(event, 'session', session.token, getCookieSerializeOptions())
  return session
})
