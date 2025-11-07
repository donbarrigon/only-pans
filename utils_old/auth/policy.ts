import type { H3Event } from 'h3'
import { getCookie, getHeader } from 'h3'
import { sessionHeaders, getSession } from './session'
import { unauthorizedError } from '../error/error'
import { type Session, can } from './session'

const minScore = process.env.SESSION_MIN_SCORE ? Number(process.env.SESSION_MIN_SCORE) : 3

export async function auth(event: H3Event, permission?: string): Promise<Session> {
  let token: string | undefined
  const tkc = getCookie(event, 'session')

  if (tkc) {
    token = tkc
  } else {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1]
      }
    }
  }
  if (!token) {
    return unauthorizedError()
  }

  const session = await getSession(token)
  const headers = sessionHeaders(event)
  let score = 0

  if (session.ip === headers.ip) {
    score++
  }
  if (session.agent === headers.agent) {
    score++
  }
  if (session.lang === headers.lang) {
    score++
  }
  if (session.referer === headers.referer) {
    score++
  }
  if (session.fingerprint === headers.fingerprint) {
    score++
  }

  if (score < minScore) {
    return unauthorizedError()
  }

  if (permission) {
    can(session, permission)
  }
  return session
}
