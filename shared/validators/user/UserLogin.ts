import * as v from 'valibot'

export const UserLogin = v.object({
  email: v.pipe(
    v.string('El email debe ser una cadena de texto'),
    v.nonEmpty('El email no puede estar vacío'),
    v.email('El formato del email no es válido'),
    v.maxLength(254, 'El email debe tener como máximo 254 caracteres')
  ),
  password: v.pipe(
    v.string('La contraseña debe ser una cadena de texto'),
    v.minLength(8, 'La contraseña debe tener al menos 8 caracteres'),
    v.maxLength(32, 'La contraseña debe tener como máximo 32 caracteres')
  ),
})

export type UserLoginInput = v.InferInput<typeof UserLogin>
export type UserLoginOutput = v.InferOutput<typeof UserLogin>
