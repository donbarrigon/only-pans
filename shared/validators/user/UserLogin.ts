import * as v from 'valibot'

export const UserLogin = v.object({
  email: v.pipe(
    v.string('Las credenciales no son validas'),
    v.nonEmpty('Las credenciales no son validas'),
    v.email('Las credenciales no son validas'),
    v.maxLength(254, 'Las credenciales no son validas')
  ),
  password: v.pipe(
    v.string('Las credenciales no son validas'),
    v.minLength(8, 'Las credenciales no son validas'),
    v.maxLength(32, 'Las credenciales no son validas')
  ),
})

export type UserLoginInput = v.InferInput<typeof UserLogin>
export type UserLoginOutput = v.InferOutput<typeof UserLogin>
