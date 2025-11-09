import type { H3Error, H3Event } from 'h3'
import { send, setResponseStatus, setResponseHeader } from 'h3'
import { Err } from '../error/result'

export function responseOk<T>(event: H3Event, data: T) {
  setResponseStatus(event, 200)
  setResponseHeader(event, 'Content-Type', 'application/json')
  send(event, JSON.stringify(data))
}

export function responseCreated<T>(event: H3Event, data: T) {
  setResponseStatus(event, 201)
  setResponseHeader(event, 'Content-Type', 'application/json')
  send(event, JSON.stringify(data))
}

export function responseNoContent(event: H3Event) {
  setResponseStatus(event, 204)
  send(event)
}

export function responseError(event: H3Event, e: Err) {
  setResponseStatus(event, e.error.statusCode || 500)
  setResponseHeader(event, 'Content-Type', 'application/json')
  send(event, JSON.stringify({ message: e.error.message, errors: e.error.data }))
}
