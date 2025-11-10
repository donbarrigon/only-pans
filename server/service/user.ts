import bcrypt from 'bcrypt'
import { internalError } from '~~/shared/utils/error/error'
import { ok, Result } from '~~/shared/utils/error/result'

export async function hashPasswordService(password: string): Promise<Result<string>> {
  try {
    return ok(await bcrypt.hash(password, 10))
  } catch (e) {
    return internalError(e, 'No fue posible hashear la contraseña')
  }
}
