import * as v from 'valibot'

export const UserUpdateProfile = v.object({
  name: v.pipe(
    v.string('El nombre debe ser una cadena de texto'),
    v.nonEmpty('El nombre no puede estar vacío'),
    v.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    v.maxLength(32, 'El nombre debe tener como máximo 32 caracteres')
  ),
  nickname: v.pipe(
    v.string('El nickname debe ser una cadena de texto'),
    v.nonEmpty('El nickname no puede estar vacío'),
    v.minLength(2, 'El nickname debe tener al menos 2 caracteres'),
    v.maxLength(32, 'El nickname debe tener como máximo 32 caracteres')
  ),
  phone: v.nullable(
    v.pipe(
      v.string('El teléfono debe ser una cadena de texto'),
      v.minLength(2, 'El teléfono debe tener al menos 2 caracteres'),
      v.maxLength(32, 'El teléfono debe tener como máximo 32 caracteres'),
      v.regex(/^\+?[\d\s]{7,20}$/, 'El Teléfono no es válido')
    )
  ),
})

export type UserUpdateProfileInput = v.InferInput<typeof UserUpdateProfile>
export type UserUpdateProfileOutput = v.InferInput<typeof UserUpdateProfile>
