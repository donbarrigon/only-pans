import { getUserByHexId, updateUserEmail } from '~~/server/repositories/user'
import { responseError } from '~~/shared/utils/response/json'
import { validateBody } from '~~/shared/utils/validation/json'
import { UserUpdateEmail } from '~~/shared/validators/user/UserUpdateEmail'

export default defineEventHandler(async event => {
  const dto = await validateBody(event, UserUpdateEmail)
  if (dto.error) {
    return responseError(event, dto)
  }
  const id = event.context.params?.id ?? ''

  const user = await getUserByHexId(id)
  if (user.error) {
    return responseError(event, user)
  }

  const r = await updateUserEmail(user.value, dto.value.email)
  if (r.error) {
    return responseError(event, r)
  }
})
