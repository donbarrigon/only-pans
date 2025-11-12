import * as v from 'valibot'

export const UserUpdatePassword = v.object({
  password: v.pipe(
    v.string('La contraseña debe ser una cadena de texto'),
    v.minLength(8, 'La contraseña debe tener al menos 8 caracteres'),
    v.maxLength(32, 'La contraseña debe tener como máximo 32 caracteres')
  ),
})

export type UserUpdatePasswordInput = v.InferInput<typeof UserUpdatePassword>
export type UserUpdatePasswordOutput = v.InferOutput<typeof UserUpdatePassword>
