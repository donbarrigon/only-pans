import type { H3Event } from 'h3'
import { can, type Session } from '~~/shared/utils/auth/session'
import { auth } from '~~/shared/utils/auth/auth'
import { forbiddenError } from '~~/shared/utils/error/error'
import { Result } from '~~/shared/utils/error/result'

export async function userViewAnyPolicy(event: H3Event): Promise<Result<Session>> {
  return auth(event, 'view-any user')
}

export async function userViewPolicy(event: H3Event): Promise<Result<Session>> {
  const session = await auth(event)
  if (session.error) {
    return session
  }
  const rcan = can(session.value, 'view user')
  if (!rcan.error) {
    return session // si el usuario tiene permiso
  }
  const userId = event.context.params?.id
  if (session.value.user._id?.toHexString() === userId) {
    return session // si el usuario es el mismo
  }
  return forbiddenError()
}

export async function userUpdatePolicy(event: H3Event): Promise<Result<Session>> {
  const session = await auth(event)
  if (session.error) {
    return session
  }
  const rcan = can(session.value, 'update user')
  if (!rcan.error) {
    return session // si el usuario tiene permiso
  }
  const userId = event.context.params?.id
  if (session.value.user._id?.toHexString() === userId) {
    return session // si el usuario es el mismo
  }
  return forbiddenError()
}

export async function userUpdatePasswordPolicy(event: H3Event): Promise<Result<Session>> {
  const session = await auth(event)
  if (session.error) {
    return session
  }
  const userId = event.context.params?.id
  if (session.value.user._id?.toHexString() === userId) {
    return session
  }
  return forbiddenError()
}

export async function userDeletePolicy(event: H3Event): Promise<Result<Session>> {
  return auth(event, 'delete user')
}
