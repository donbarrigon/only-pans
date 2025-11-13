import { getUserByHexId } from '~~/server/repositories/user'
import { responseError, responseOk } from '~~/shared/utils/response/json'
import { newUserResource } from '~~/server/resources/user'
import { userViewPolicy } from '~~/server/policies/user'
// show
export default defineEventHandler(async event => {
  const session = await userViewPolicy(event)
  if (session.error) {
    return responseError(event, session)
  }

  const user = await getUserByHexId(event.context.params?.id ?? '')
  if (user.error) {
    return responseError(event, user)
  }

  return responseOk(event, newUserResource(user.value))
})
