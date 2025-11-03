import { UserStore } from '@@/shared/validators/UserStore.js'
import { validateBody } from '@@/utils/validator.js'

export default defineEventHandler(async event => {
  const dto = await validateBody(event, UserStore)
  console.log(dto)
})
