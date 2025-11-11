import * as v from 'valibot'

export const UserUpdateEmail = v.object({
  email: v.pipe(
    v.string('El email debe ser una cadena de texto'),
    v.nonEmpty('El email no puede estar vacío'),
    v.email('El formato del email no es válido'),
    v.maxLength(254, 'El email debe tener como máximo 254 caracteres')
  ),
})

export type UserUpdateEmailInput = v.InferInput<typeof UserUpdateEmail>
export type UserUpdateEmailOutput = v.InferOutput<typeof UserUpdateEmail>
