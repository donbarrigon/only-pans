import * as v from 'valibot'
import { decode } from '@msgpack/msgpack'

/**
 * Valida el cuerpo de una petición en formato msgpack
 * @template T
 * @param {import('h3').H3Event} event - Evento de la petición
 * @param {import('valibot').GenericSchema<T>} validator - Schema de Valibot para validar
 * @returns {Promise<T>} Los datos validados
 * @throws {Error} Si el cuerpo no es válido o está mal formateado
 */
export async function validateBody(event, validator) {
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No fue posible leer el cuerpo de la petición',
    })
  }

  let body
  try {
    body = decode(rawBody)
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El formato del cuerpo de la petición no es inválido',
      error: true,
      message: e.message,
      stack: e.stack,
      cause: e,
    })
  }

  const result = v.safeParse(validator, body)
  if (result.success) {
    return result.output
  }
  throw createError({
    statusCode: 422,
    statusMessage: 'Los datos enviados no son válidos',
    data: result.issues.map(issue => ({
      field: issue.path?.[0]?.key,
      message: issue.message,
    })),
  })
}
