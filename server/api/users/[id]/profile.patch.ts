import { userUpdatePolicy } from '~~/server/policies/user'
import { coll } from '~~/server/repositories/collections'
import { createHistory } from '~~/server/repositories/history'
import { getUserByHexId, updateUserProfile } from '~~/server/repositories/user'
import { responseError, responseOk } from '~~/shared/utils/response/json'
import { validateBody } from '~~/shared/utils/validation/json'
import { UserUpdateProfile } from '~~/shared/validators/user/UserUpdateProfile'

export default defineEventHandler(async event => {
  const id = event.context.params?.id ?? ''
  const session = await userUpdatePolicy(event)
  if (session.error) {
    return responseError(event, session)
  }

  const dto = await validateBody(event, UserUpdateProfile)
  if (dto.error) {
    return responseError(event, dto)
  }

  const user = await getUserByHexId(id)
  if (user.error) {
    return responseError(event, user)
  }

  const changes = await updateUserProfile(user.value, dto.value)
  if (changes.error) {
    return responseError(event, changes)
  }

  createHistory(coll.user, session.value.user._id, 'update-profile', changes.value)

  return responseOk(event, user.value)
})
