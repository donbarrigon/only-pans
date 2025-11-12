import { userUpdatePolicy } from '~~/server/policies/user'
import { coll } from '~~/server/repositories/collections'
import { createHistory, UPDATE_ACTION } from '~~/server/repositories/history'
import { getUserByHexId, updateUserEmail } from '~~/server/repositories/user'
import { sendEmailChangeRevert, sendEmailVerfification } from '~~/server/service/mail'
import { destroyAllSessions } from '~~/shared/utils/auth/session'
import { responseError, responseNoContent } from '~~/shared/utils/response/json'
import { validateBody } from '~~/shared/utils/validation/json'
import { UserUpdateEmail } from '~~/shared/validators/user/UserUpdateEmail'

export default defineEventHandler(async event => {
  const id = event.context.params?.id ?? ''
  const session = await userUpdatePolicy(event)
  if (session.error) {
    return responseError(event, session)
  }

  const dto = await validateBody(event, UserUpdateEmail)
  if (dto.error) {
    return responseError(event, dto)
  }

  const user = await getUserByHexId(id)
  if (user.error) {
    return responseError(event, user)
  }

  const changes = await updateUserEmail(user.value, dto.value.email)
  if (changes.error) {
    return responseError(event, changes)
  }

  sendEmailVerfification(user.value)
  sendEmailChangeRevert(user.value, changes.value.old.email)

  destroyAllSessions(user.value._id!.toHexString())
  createHistory(coll.user, session.value.user._id, UPDATE_ACTION, changes.value)

  return responseNoContent(event)
})
