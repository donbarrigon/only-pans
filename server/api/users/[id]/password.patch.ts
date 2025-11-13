import { userUpdatePolicy } from '~~/server/policies/user'
import { getUserByHexId } from '~~/server/repositories/user'
import { responseError, responseNoContent } from '~~/shared/utils/response/json'
import { validateBody } from '~~/shared/utils/validation/json'
import { UserUpdatePassword } from '~~/shared/validators/user/UserUpdatePassword'
import { updateUserPassword } from '~~/server/repositories/user'
import { createHistory, voidChanges } from '~~/server/repositories/history'
import { destroyAllSessions } from '~~/shared/utils/auth/session'
import { coll } from '~~/server/repositories/collections'

export default defineEventHandler(async event => {
  const id = event.context.params?.id ?? ''
  const session = await userUpdatePolicy(event)
  if (session.error) {
    return responseError(event, session)
  }

  const dto = await validateBody(event, UserUpdatePassword)
  if (dto.error) {
    return responseError(event, dto)
  }

  const user = await getUserByHexId(id)
  if (user.error) {
    return responseError(event, user)
  }

  const changes = await updateUserPassword(user.value, dto.value.password)
  if (changes.error) {
    return responseError(event, changes)
  }

  destroyAllSessions(user.value._id!.toHexString())
  createHistory(coll.user, session.value.user._id, 'update-password', voidChanges(user.value._id!))

  return responseNoContent(event)
})
