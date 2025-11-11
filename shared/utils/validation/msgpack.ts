import * as v from 'valibot'
import { decode } from '@msgpack/msgpack'
import type { H3Event } from 'h3'
import { readRawBody, createError } from 'h3'
import { extensionCodec } from '../fetch/extensionCodec'
import { err, ok, type Result } from '../error/result'
import { badRequestError } from '../error/error'

/**
 * Valida el cuerpo de una petición en formato msgpack
 * @template T - El tipo de datos esperado después de la validación
 * @param event - Evento de la petición H3
 * @param validator - Schema de Valibot para validar
 * @returns Los datos validados
 * @throws Error si el cuerpo no es válido o está mal formateado
 */
export async function validateBufferBody<T>(event: H3Event, validator: v.GenericSchema<T, T>): Promise<Result<T>> {
  const rawBody = await readRawBody(event, false)

  if (!rawBody) {
    return badRequestError('No fue posible leer el cuerpo de la petición')
  }

  let body: unknown
  try {
    body = decode(rawBody, { extensionCodec: extensionCodec })
  } catch (e) {
    const error = e as Error
    throw err(
      createError({
        statusCode: 400,
        statusMessage: 'El formato del cuerpo de la petición no es válido',
        data: {
          error: true,
          message: error.message,
          stack: error.stack,
        },
        cause: error,
      })
    )
  }

  const result = v.safeParse(validator, body)

  if (result.success) {
    return ok(result.output)
  }

  return err(
    createError({
      statusCode: 422,
      statusMessage: 'Los datos enviados no son válidos',
      data: result.issues.map(issue => ({
        field: issue.path?.[0]?.key,
        message: issue.message,
      })),
    })
  )
}
