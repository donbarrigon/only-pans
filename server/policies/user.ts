import type { H3Event } from 'h3'
import type { Session } from '~~/utils/auth/Session'
import { auth } from '~~/utils/auth/policy'
import { forbiddenError } from '~~/utils/error/error'

export async function UserViewAnyPolicy(event: H3Event): Promise<Session> {
  return await auth(event, 'view-any user')
}

export async function UserViewPolicy(event: H3Event): Promise<Session> {
  const session = await auth(event, 'view user')
  const userId = event.context.params?.id
  if (session.user._id?.toHexString() !== userId) {
    return forbiddenError()
  }
  return session
}

export async function UserUpdatePolicy(event: H3Event): Promise<Session> {
  const session = await auth(event, 'update user')
  const userId = event.context.params?.id
  if (session.user._id?.toHexString() !== userId) {
    return forbiddenError()
  }
  return session
}

export async function UserDeletePolicy(event: H3Event): Promise<Session> {
  const session = await auth(event, 'delete user')
  const userId = event.context.params?.id
  if (session.user._id?.toHexString() !== userId) {
    return forbiddenError()
  }
  return session
}
