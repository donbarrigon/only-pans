import type { H3Event } from 'h3'
import type { Session } from '~~/shared/utils/auth/session'
import { auth } from '~~/shared/utils/auth/policy'
import { forbiddenError } from '~~/shared/utils/error/error'
import { Result } from '~~/shared/utils/error/result'

export async function UserViewAnyPolicy(event: H3Event): Promise<Result<Session>> {
  return await auth(event, 'view-any user')
}

export async function UserViewPolicy(event: H3Event): Promise<Result<Session>> {
  const session = await auth(event, 'view user')
  if (session.error) {
    return forbiddenError()
  }
  const userId = event.context.params?.id
  if (session.value.user._id?.toHexString() !== userId) {
    return forbiddenError()
  }
  return session
}

export async function UserUpdatePolicy(event: H3Event): Promise<Result<Session>> {
  const session = await auth(event, 'update user')
  if (session.error) {
    return forbiddenError()
  }
  const userId = event.context.params?.id
  if (session.value.user._id?.toHexString() !== userId) {
    return forbiddenError()
  }
  return session
}

export async function UserDeletePolicy(event: H3Event): Promise<Result<Session>> {
  const session = await auth(event, 'delete user')
  if (session.error) {
    return forbiddenError()
  }
  const userId = event.context.params?.id
  if (session.value.user._id?.toHexString() !== userId) {
    return forbiddenError()
  }
  return session
}
