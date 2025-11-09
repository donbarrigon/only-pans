import { createError } from 'h3'
import { Err, okVoid, Result } from './result'

// Map de mensajes estándar de errores HTTP
const errorMessages: Record<number, string> = {
  400: 'La información enviada no es válida',
  401: 'Necesitas iniciar sesión para continuar',
  403: 'No tienes permiso para realizar esta acción',
  404: 'No pudimos encontrar lo que buscas',
  405: 'Método HTTP no permitido',
  406: 'El contenido solicitado no es aceptable',
  408: 'La solicitud tardó demasiado',
  409: 'Esta acción no se puede completar porque hay información duplicada',
  410: 'El recurso ya no está disponible',
  412: 'No se cumplieron las condiciones requeridas',
  415: 'Tipo de contenido no soportado',
  418: 'Soy una tetera ☕',
  422: 'Revisa los datos que ingresaste e intenta de nuevo',
  425: 'La solicitud es demasiado temprana',
  426: 'Actualiza tu cliente o versión',
  429: 'Has hecho demasiados intentos. Por favor, espera un momento',
  431: 'Encabezados de solicitud demasiado grandes',
  451: 'Contenido no disponible por restricciones legales',
  500: 'Algo salió mal',
  501: 'Funcionalidad no implementada',
  502: 'El servicio no está disponible en este momento',
  503: 'El servicio está temporalmente fuera de línea',
  504: 'La operación tardó demasiado. Por favor, intenta de nuevo',
  505: 'Versión HTTP no soportada',
  507: 'Espacio insuficiente en el servidor',
  508: 'Bucle detectado',
  511: 'Se requiere autenticación de red',
}

/**
 * Lanza un error HTTP estandarizado
 * @param e Error, string o number
 * @param statusCode Código HTTP opcional (por defecto 500)
 * @param customMessage Mensaje personalizado opcional
 */
export function httpError(e?: unknown, statusCode?: number, customMessage?: string): Err {
  // Si e es un número, interpretarlo como statusCode
  if (typeof e === 'number') {
    statusCode = errorMessages[e] ? e : 500
  }

  const code = statusCode ?? 500
  const message = customMessage || errorMessages[code] || 'Error desconocido'
  const isFatal = code >= 500

  if (e instanceof Error) {
    return {
      value: undefined,
      error: createError({
        statusCode: code,
        statusMessage: message,
        message: e.message,
        stack: e.stack,
        cause: e.cause,
        fatal: isFatal,
        name: e.name,
      }),
    }
  }

  if (typeof e === 'string') {
    return {
      value: undefined,
      error: createError({
        statusCode: code,
        statusMessage: e, // mensaje personalizado
        message: message, // mensaje predeterminado por rellenar
        fatal: isFatal,
      }),
    }
  }

  return {
    value: undefined,
    error: createError({
      statusCode: code,
      statusMessage: message,
      fatal: isFatal,
    }),
  }
}
// ================================================================
//                  🧱 Errores 4xx (Cliente)
// ================================================================

/**
 * Lanza un error 400 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function badRequestError(e?: unknown, message?: string): Err {
  return httpError(e, 400, message)
}

/**
 * Lanza un error 401 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function unauthorizedError(e?: unknown, message?: string): Err {
  return httpError(e, 401, message)
}

/**
 * Lanza un error 403 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function forbiddenError(e?: unknown, message?: string): Err {
  return httpError(e, 403, message)
}

/**
 * Lanza un error 404 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function notFoundError(e?: unknown, message?: string): Err {
  return httpError(e, 404, message)
}

/**
 * Lanza un error 405 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function methodNotAllowedError(e?: unknown, message?: string): Err {
  return httpError(e, 405, message)
}

/**
 * Lanza un error 406 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function notAcceptableError(e?: unknown, message?: string): Err {
  return httpError(e, 406, message)
}

/**
 * Lanza un error 408 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function requestTimeoutError(e?: unknown, message?: string): Err {
  return httpError(e, 408, message)
}

/**
 * Lanza un error 409 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function conflictError(e?: unknown, message?: string): Err {
  return httpError(e, 409, message)
}

/**
 * Lanza un error 410 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function goneError(e?: unknown, message?: string): Err {
  return httpError(e, 410, message)
}

/**
 * Lanza un error 412 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function preconditionFailedError(e?: unknown, message?: string): Err {
  return httpError(e, 412, message)
}

/**
 * Lanza un error 415 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function unsupportedMediaTypeError(e?: unknown, message?: string): Err {
  return httpError(e, 415, message)
}

/**
 * Lanza un error 418 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function teapotError(e?: unknown, message?: string): Err {
  return httpError(e, 418, message)
}

/**
 * Lanza un error 422 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function unprocessableEntityError(e?: unknown, message?: string): Err {
  return httpError(e, 422, message)
}

/**
 * Lanza un error 425 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function tooEarlyError(e?: unknown, message?: string): Err {
  return httpError(e, 425, message)
}

/**
 * Lanza un error 426 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function upgradeRequiredError(e?: unknown, message?: string): Err {
  return httpError(e, 426, message)
}

/**
 * Lanza un error 429 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function tooManyRequestsError(e?: unknown, message?: string): Err {
  return httpError(e, 429, message)
}

/**
 * Lanza un error 431 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function requestHeaderFieldsTooLargeError(e?: unknown, message?: string): Err {
  return httpError(e, 431, message)
}

/**
 * Lanza un error 451 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function unavailableForLegalReasonsError(e?: unknown, message?: string): Err {
  return httpError(e, 451, message)
}

// ================================================================
//                    🧱 Errores 5xx (Servidor)
// ================================================================

/**
 * Lanza un error 500 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function internalError(e?: unknown, message?: string): Err {
  if (!e) {
    httpError(500)
  }
  return httpError(e, 500, message)
}

/**
 * Lanza un error 501 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function notImplementedError(e?: unknown, message?: string): Err {
  return httpError(e, 501, message)
}

/**
 * Lanza un error 502 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function badGatewayError(e?: unknown, message?: string): Err {
  return httpError(e, 502, message)
}

/**
 * Lanza un error 503 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function serviceUnavailableError(e?: unknown, message?: string): Err {
  return httpError(e, 503, message)
}

/**
 * Lanza un error 504 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function gatewayTimeoutError(e?: unknown, message?: string): Err {
  return httpError(e, 504, message)
}

/**
 * Lanza un error 505 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function httpVersionNotSupportedError(e?: unknown, message?: string): Err {
  return httpError(e, 505, message)
}

/**
 * Lanza un error 506 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function variantAlsoNegotiatesError(e?: unknown, message?: string): Err {
  return httpError(e, 506, message)
}

/**
 * Lanza un error 507 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function insufficientStorageError(e?: unknown, message?: string): Err {
  return httpError(e, 507, message)
}

/**
 * Lanza un error 508 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function loopDetectedError(e?: unknown, message?: string): Err {
  return httpError(e, 508, message)
}

/**
 * Lanza un error 509 estandarizado
 * @param e Error, string o number
 * @param message Mensaje personalizado opcional
 */
export function bandwidthLimitExceededError(e?: unknown, message?: string): Err {
  return httpError(e, 509, message)
}
export function networkAuthenticationRequiredError(e?: unknown, message?: string): Err {
  return httpError(e, 511, message)
}

// ================================================================
//                    🗄️ Errores de MongoDB
// ================================================================

/**
 * Convierte errores de MongoDB en errores HTTP apropiados
 * @param e - Error de MongoDB
 */
export function mongoError(e: unknown): Err {
  // Si no hay error, lanzar error interno genérico
  if (!e) {
    return internalError(new Error('Unknown database error'), 'Error desconocido en la base de datos')
  }

  // Extraer propiedades del error si es un objeto
  const error = e as { code?: number; name?: string; message?: string }
  const code = error.code
  const name = error.name
  const message = error.message

  // --- 1. Errores de duplicidad ---
  if (code === 11000 || code === 11001) {
    return conflictError(e, 'Este registro ya existe')
  }

  // --- 2. Error de validación de esquema ---
  if (code === 121) {
    return badRequestError(e, 'Los datos no cumplen con el formato esperado')
  }

  // --- 3. Document too large ---
  if (code === 10334) {
    return badRequestError(e, 'Los datos son demasiado grandes')
  }

  // --- 4. Write concern errors ---
  if (code === 64 || code === 65 || code === 91 || code === 100) {
    return serviceUnavailableError(e, 'No pudimos guardar los datos, intenta de nuevo')
  }

  // --- 5. Errores de transacciones ---
  if (code === 251 || code === 244 || code === 112) {
    return conflictError(e, 'Hubo un problema con la operación, intenta nuevamente')
  }

  // --- 6. Namespace no existe ---
  if (code === 26) {
    return notFoundError(e, 'No encontramos lo que buscabas')
  }

  // --- 7. Cursor no encontrado ---
  if (code === 43) {
    return badRequestError(e, 'La búsqueda expiró, por favor intenta de nuevo')
  }

  // --- 8. Operación interrumpida ---
  if (code === 11601 || code === 11602) {
    return requestTimeoutError(e, 'La operación tardó demasiado')
  }

  // --- 9. MaxTimeMSExpired ---
  if (code === 50) {
    return requestTimeoutError(e, 'La operación tardó demasiado tiempo')
  }

  // --- 10. Errores de conexión ---
  if (name === 'MongoNetworkError' || name === 'MongoTimeoutError') {
    return serviceUnavailableError(e, 'No pudimos conectarnos a la base de datos')
  }

  // --- 11. Errores de tipo BSON ---
  if (name === 'BSONTypeError' || name === 'BSONError') {
    return unprocessableEntityError(e, 'El tipo de dato no es válido')
  }

  // --- 12. Operación en nodo no primario ---
  if (code === 10058 || code === 13436 || message?.includes('not master') || message?.includes('not primary')) {
    return serviceUnavailableError(e, 'La base de datos no está disponible en este momento')
  }

  // --- 13. Errores de autenticación/autorización ---
  if (code === 13 || code === 18) {
    return unauthorizedError(e, 'No tienes permiso para hacer esto')
  }

  if (code === 8000 || code === 31) {
    return forbiddenError(e, 'No puedes realizar esta acción')
  }

  // --- 14. Error de índice inexistente ---
  if (code === 27 || code === 85) {
    return badRequestError(e, 'Hay un problema con la configuración de la búsqueda')
  }

  // --- 15. Comando desconocido ---
  if (code === 59) {
    return badRequestError(e, 'La operación solicitada no existe')
  }

  // --- 16. Límite de memoria excedido ---
  if (code === 292) {
    return serviceUnavailableError(e, 'La operación necesita demasiados recursos')
  }

  // --- 17. Errores de tipo MongoParseError ---
  if (name === 'MongoParseError') {
    return badRequestError(e, 'Hubo un problema al procesar la solicitud')
  }

  // --- 18. Errores de MongoDB Atlas/AWS ---
  if (name === 'MongoAWSError') {
    return serviceUnavailableError(e, 'No pudimos autenticarnos con el servicio')
  }

  // --- 19. Errores de TopologyDestroyed ---
  if (name === 'MongoTopologyClosedError') {
    return serviceUnavailableError(e, 'Perdimos la conexión con la base de datos')
  }

  // --- 20. Errores generales de servidor Mongo ---
  if (name === 'MongoServerError' || name === 'MongoError') {
    return internalError(e, 'Hubo un problema con la base de datos')
  }

  // --- 21. Fallback ---
  return internalError(e, 'Algo salió mal con la base de datos')
}

export function mongoResultError(e: any): Result<void> {
  if (e?.matchedCount === 0) {
    return notFoundError(e, 'No encontramos lo que buscabas')
  }
  if (e?.modifiedCount === 0) {
    return unprocessableEntityError(e, 'No hay cambios')
  }
  if (e?.deletedCount === 0) {
    return notFoundError(e, 'Nada para eliminar')
  }
  return okVoid
}
