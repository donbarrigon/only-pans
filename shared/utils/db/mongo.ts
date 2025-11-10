import type { Collection, Db } from 'mongodb'
import { MongoClient } from 'mongodb'

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
