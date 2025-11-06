import type { Collection, Db } from 'mongodb'
import { MongoClient } from 'mongodb'

const dbString = process.env.DB_STRING
const dbName = process.env.DB_NAME

if (!dbString || !dbName) {
  throw new Error('Falta la variable de entorno DB_STRING o DB_NAME')
}

const client: MongoClient = await MongoClient.connect(dbString)
console.log(`✅ Conexión MongoDB [${dbString}] establecida`)

export async function connectDB() {
  await client.connect()
  console.log(`✅ Conexión MongoDB [${dbString}] establecida`)
}

export function db(): Db {
  return client.db(dbName)
}

export function dbc(name: string): Collection<Document> {
  return client.db(dbName).collection(name)
}

export async function closeDB() {
  if (client) {
    await client.close()
    console.log(`📵 Conexión MongoDB cerrada`)
  }
}
