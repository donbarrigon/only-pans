import { userViewAnyPolicy } from '~~/server/policies/user'
import { getAllUsers } from '~~/server/repositories/user'
import { newUserCollection } from '~~/server/resources/user'
import { getQueryFindOptions } from '~~/shared/utils/db/mongo'
import { responseError, responseOk } from '~~/shared/utils/response/json'

export default defineEventHandler(async event => {
  const session = await userViewAnyPolicy(event)
  if (session.error) {
    return responseError(event, session)
  }

  const options = getQueryFindOptions(event)
  if (options.error) {
    return responseError(event, options)
  }

  const users = await getAllUsers(options.value)
  if (users.error) {
    return responseError(event, users)
  }

  return responseOk(event, newUserCollection(users.value))
})
