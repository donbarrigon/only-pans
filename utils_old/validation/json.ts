import type { GenericSchema } from 'valibot'
import { safeParse } from 'valibot'
import type { H3Event } from 'h3'

/**
 * Valida el cuerpo de una petición en formato json
 * @template T - El tipo de datos esperado después de la validación
 * @param event - Evento de la petición H3
 * @param validator - Schema de Valibot para validar
 * @returns Los datos validados
 * @throws Error si el cuerpo no es válido o está mal formateado
 */
export async function validateBody<T>(event: H3Event, validator: GenericSchema<T, T>): Promise<T> {
  const rawBody = await readBody(event)

  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No fue posible leer el cuerpo de la petición',
    })
  }

  const result = safeParse(validator, rawBody)

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
