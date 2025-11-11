import type { Collection, Db } from 'mongodb'
import { MongoClient } from 'mongodb'
import { getQuery, H3Event } from 'h3'
import { ok, type Result } from '../error/result'
import { badRequestError } from '../error/error'
import type { FindCursor, Sort } from 'mongodb'

const dbString = process.env.DB_STRING
const dbName = process.env.DB_NAME
if (!dbString || !dbName) {
  throw new Error('Falta la variable de entorno DB_STRING o DB_NAME')
}

export const mongoClient: MongoClient = await MongoClient.connect(dbString)
export const db = mongoClient.db(dbName)
console.log(`✅ Conexión MongoDB [${dbString}] establecida`)

export async function connectDB() {
  await mongoClient.connect()
  console.log(`✅ Conexión MongoDB [${dbString}] establecida`)
}

export function getDb(): Db {
  if (!mongoClient) {
    throw new Error('No hay conexión a la base de datos')
  }
  if (!dbName) {
    return mongoClient.db(dbName)
  }
  return db
}

export function dbc(name: string): Collection<Document> {
  return mongoClient.db(dbName).collection(name)
}

export async function closeDB() {
  if (mongoClient) {
    await mongoClient.close()
    console.log(`📵 Conexión MongoDB cerrada`)
  }
}

export interface QueryFindOptions {
  projection: Record<string, number> | undefined
  limit: number
  skip: number
  sort: Sort
}

export function queryFindOptions(event: H3Event): Result<QueryFindOptions> {
  const q = getQuery(event)
  let per_page: number = 15
  let page: number = 1
  const sort: Record<string, 1 | -1> = {}

  // ================ PER PAGE ================
  if (q.per_page) {
    if (typeof q.per_page === 'string') {
      per_page = Number(q.per_page)
    } else {
      return badRequestError('per_page debe ser un número entero entre 1 y 1000')
    }
    if (isNaN(per_page) || !Number.isInteger(per_page) || per_page < 1 || per_page > 1000) {
      return badRequestError('per_page debe ser un número entero entre 1 y 1000')
    }
  }

  // ================ PAGE ================
  if (q.page) {
    if (typeof q.page === 'string') {
      page = Number(q.page)
    } else {
      return badRequestError('page debe ser un número')
    }
    if (isNaN(per_page) || !Number.isInteger(per_page) || page < 1) {
      return badRequestError('page debe ser un número entero positivo mayor a 0')
    }
  }

  // ================ SORT ================
  if (q.sort) {
    if (typeof q.sort === 'string') {
      if (q.sort.startsWith('-')) {
        sort[q.sort.slice(1)] = -1
      } else {
        sort[q.sort] = 1
      }
    } else if (Array.isArray(q.sort)) {
      for (const key of q.sort) {
        if (key.startsWith('-')) {
          sort[key.slice(1)] = -1
        } else {
          sort[key] = 1
        }
      }
    } else if (typeof q.sort === 'object' && q.sort !== null) {
      const entries = Object.entries(q.sort)
      for (const entry of entries) {
        const key = entry[0]
        const value = entry[1]
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'desc' || value === '-1') {
            sort[key] = -1
          } else if (value.toLowerCase() === 'asc' || value === '1') {
            sort[key] = 1
          } else {
            return badRequestError('los valores de sort deben ser 1, -1, asc o desc')
          }
        } else if (typeof value === 'number') {
          if (value === -1) {
            sort[key] = -1
          } else if (value === 1) {
            sort[key] = 1
          } else {
            return badRequestError('los valores de sort deben ser 1, -1, asc o desc')
          }
        }
      }
    } else {
      return badRequestError('sort debe ser un array, un objeto o una cadena de texto separada por comas')
    }
  }

  // ================ PROJECTION ================
  if (q.fields) {
    const projection: Record<string, 1 | 0> = {}
    if (typeof q.fields === 'string') {
      const fields = q.fields.split(',')
      for (const field of fields) {
        const f = field.trim()
        if (f) {
          projection[f] = 1
        }
      }
    } else if (Array.isArray(q.fields)) {
      for (const field of q.fields) {
        const f = field.trim()
        if (f) {
          projection[f] = 1
        }
      }
    } else {
      return badRequestError('fields debe ser un array o una cadena de texto separada por comas')
    }
    return ok({
      projection: projection,
      limit: per_page,
      skip: per_page * (page - 1),
      sort: sort,
    })
  }

  return ok({
    projection: undefined,
    limit: per_page,
    skip: per_page * (page - 1),
    sort: sort,
  })
}

export function setQueryFindOptions<T>(cursor: FindCursor<T>, options: QueryFindOptions): void {
  if (options.projection) {
    cursor.project(options.projection)
  }
  cursor.skip(options.skip)
  cursor.limit(options.limit)
  cursor.sort(options.sort)
}
