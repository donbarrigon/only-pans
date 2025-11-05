import { UserStore } from '~~/shared/validators/user/UserStore'
import { validateBody } from '~~/server/utils/validation/msgpack'

export default defineEventHandler(async event => {
  const dto = await validateBody(event, UserStore)

  console.log(dto)
})
