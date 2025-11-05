// Map de mensajes estándar de errores HTTP
const errorMessages: Record<number, string> = {
  400: 'La información enviada no es válida',
  401: 'Necesitas iniciar sesión para continuar',
  403: 'No tienes permiso para acceder a esto',
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
 * @param e Error, string, number o unknown
 * @param statusCode Código HTTP opcional (por defecto 500)
 * @param customMessage Mensaje personalizado opcional
 */
export function httpError(e?: unknown, statusCode?: number, customMessage?: string): never {
  // Si e es un número, interpretarlo como statusCode
  if (typeof e === 'number') {
    statusCode = errorMessages[e] ? e : 500
  }

  const code = statusCode ?? 500
  const message = customMessage || errorMessages[code] || 'Error desconocido'
  const isFatal = code >= 500

  if (e instanceof Error) {
    throw createError({
      statusCode: code,
      statusMessage: message,
      message: e.message,
      stack: e.stack,
      cause: e.cause,
      fatal: isFatal,
      name: e.name,
    })
  }

  if (typeof e === 'string') {
    throw createError({
      statusCode: code,
      statusMessage: e, // mensaje personalizado
      message: message, // mensaje predeterminado por rellenar
      fatal: isFatal,
    })
  }

  throw createError({
    statusCode: code,
    statusMessage: message,
    fatal: isFatal,
  })
}
// ================================================================
//                  🧱 Errores 4xx (Cliente)
// ================================================================

export function badRequestError(e: unknown, message?: string): never {
  httpError(e, 400, message)
}

export function unauthorizedError(e: unknown, message?: string): never {
  httpError(e, 401, message)
}

export function forbiddenError(e: unknown, message?: string): never {
  httpError(e, 403, message)
}

export function notFoundError(e: unknown, message?: string): never {
  httpError(e, 404, message)
}

export function methodNotAllowedError(e: unknown, message?: string): never {
  httpError(e, 405, message)
}

export function notAcceptableError(e: unknown, message?: string): never {
  httpError(e, 406, message)
}

export function requestTimeoutError(e: unknown, message?: string): never {
  httpError(e, 408, message)
}

export function conflictError(e: unknown, message?: string): never {
  httpError(e, 409, message)
}

export function goneError(e: unknown, message?: string): never {
  httpError(e, 410, message)
}

export function preconditionFailedError(e: unknown, message?: string): never {
  httpError(e, 412, message)
}

export function unsupportedMediaTypeError(e: unknown, message?: string): never {
  httpError(e, 415, message)
}

export function teapotError(e: unknown, message?: string): never {
  httpError(e, 418, message)
}

export function unprocessableEntityError(e: unknown, message?: string): never {
  httpError(e, 422, message)
}

export function tooEarlyError(e: unknown, message?: string): never {
  httpError(e, 425, message)
}

export function upgradeRequiredError(e: unknown, message?: string): never {
  httpError(e, 426, message)
}

export function tooManyRequestsError(e: unknown, message?: string): never {
  httpError(e, 429, message)
}

export function requestHeaderFieldsTooLargeError(e: unknown, message?: string): never {
  httpError(e, 431, message)
}

export function unavailableForLegalReasonsError(e: unknown, message?: string): never {
  httpError(e, 451, message)
}

// ================================================================
//                    🧱 Errores 5xx (Servidor)
// ================================================================

export function internalError(e?: unknown, message?: string): never {
  if (!e) {
    httpError(500)
  }
  httpError(e, 500, message)
}

export function notImplementedError(e: unknown, message?: string): never {
  httpError(e, 501, message)
}

export function badGatewayError(e: unknown, message?: string): never {
  httpError(e, 502, message)
}

export function serviceUnavailableError(e: unknown, message?: string): never {
  httpError(e, 503, message)
}

export function gatewayTimeoutError(e: unknown, message?: string): never {
  httpError(e, 504, message)
}

export function httpVersionNotSupportedError(e: unknown, message?: string): never {
  httpError(e, 505, message)
}

export function insufficientStorageError(e: unknown, message?: string): never {
  httpError(e, 507, message)
}

export function loopDetectedError(e: unknown, message?: string): never {
  httpError(e, 508, message)
}

export function networkAuthenticationRequiredError(e: unknown, message?: string): never {
  httpError(e, 511, message)
}

// ================================================================
//                    🗄️ Errores de MongoDB
// ================================================================

/**
 * Convierte errores de MongoDB en errores HTTP apropiados
 * @param e - Error de MongoDB
 */
export function mongoError(e: unknown): never {
  // Si no hay error, lanzar error interno genérico
  if (!e) {
    internalError(new Error('Unknown database error'), 'Error desconocido en la base de datos')
  }

  // Extraer propiedades del error si es un objeto
  const error = e as { code?: number; name?: string; message?: string }
  const code = error.code
  const name = error.name
  const message = error.message

  // --- 1. Errores de duplicidad ---
  if (code === 11000 || code === 11001) {
    conflictError(e, 'Este registro ya existe')
  }

  // --- 2. Error de validación de esquema ---
  if (code === 121) {
    badRequestError(e, 'Los datos no cumplen con el formato esperado')
  }

  // --- 3. Document too large ---
  if (code === 10334) {
    badRequestError(e, 'Los datos son demasiado grandes')
  }

  // --- 4. Write concern errors ---
  if (code === 64 || code === 65 || code === 91 || code === 100) {
    serviceUnavailableError(e, 'No pudimos guardar los datos, intenta de nuevo')
  }

  // --- 5. Errores de transacciones ---
  if (code === 251 || code === 244 || code === 112) {
    conflictError(e, 'Hubo un problema con la operación, intenta nuevamente')
  }

  // --- 6. Namespace no existe ---
  if (code === 26) {
    notFoundError(e, 'No encontramos lo que buscabas')
  }

  // --- 7. Cursor no encontrado ---
  if (code === 43) {
    badRequestError(e, 'La búsqueda expiró, por favor intenta de nuevo')
  }

  // --- 8. Operación interrumpida ---
  if (code === 11601 || code === 11602) {
    requestTimeoutError(e, 'La operación tardó demasiado')
  }

  // --- 9. MaxTimeMSExpired ---
  if (code === 50) {
    requestTimeoutError(e, 'La operación tardó demasiado tiempo')
  }

  // --- 10. Errores de conexión ---
  if (name === 'MongoNetworkError' || name === 'MongoTimeoutError') {
    serviceUnavailableError(e, 'No pudimos conectarnos a la base de datos')
  }

  // --- 11. Errores de tipo BSON ---
  if (name === 'BSONTypeError' || name === 'BSONError') {
    unprocessableEntityError(e, 'El tipo de dato no es válido')
  }

  // --- 12. Operación en nodo no primario ---
  if (code === 10058 || code === 13436 || message?.includes('not master') || message?.includes('not primary')) {
    serviceUnavailableError(e, 'La base de datos no está disponible en este momento')
  }

  // --- 13. Errores de autenticación/autorización ---
  if (code === 13 || code === 18) {
    unauthorizedError(e, 'No tienes permiso para hacer esto')
  }

  if (code === 8000 || code === 31) {
    forbiddenError(e, 'No puedes realizar esta acción')
  }

  // --- 14. Error de índice inexistente ---
  if (code === 27 || code === 85) {
    badRequestError(e, 'Hay un problema con la configuración de la búsqueda')
  }

  // --- 15. Comando desconocido ---
  if (code === 59) {
    badRequestError(e, 'La operación solicitada no existe')
  }

  // --- 16. Límite de memoria excedido ---
  if (code === 292) {
    serviceUnavailableError(e, 'La operación necesita demasiados recursos')
  }

  // --- 17. Errores de tipo MongoParseError ---
  if (name === 'MongoParseError') {
    badRequestError(e, 'Hubo un problema al procesar la solicitud')
  }

  // --- 18. Errores de MongoDB Atlas/AWS ---
  if (name === 'MongoAWSError') {
    serviceUnavailableError(e, 'No pudimos autenticarnos con el servicio')
  }

  // --- 19. Errores de TopologyDestroyed ---
  if (name === 'MongoTopologyClosedError') {
    serviceUnavailableError(e, 'Perdimos la conexión con la base de datos')
  }

  // --- 20. Errores generales de servidor Mongo ---
  if (name === 'MongoServerError' || name === 'MongoError') {
    internalError(e, 'Hubo un problema con la base de datos')
  }

  // --- 21. Fallback ---
  internalError(e, 'Algo salió mal con la base de datos')
}
