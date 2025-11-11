import { appendFile, readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'

export const LV_EMERGENCY = 0
export const LV_ALERT = 1
export const LV_CRITICAL = 2
export const LV_ERROR = 3
export const LV_WARNING = 4
export const LV_NOTICE = 5
export const LV_INFO = 6
export const LV_DEBUG = 7
export const LV_OFF = 8
export const RESET = LV_OFF

export const LOG_LEVEL: Record<number, string> = {
  [LV_EMERGENCY]: 'EMERGENCY',
  [LV_ALERT]: 'ALERT',
  [LV_CRITICAL]: 'CRITICAL',
  [LV_ERROR]: 'ERROR',
  [LV_WARNING]: 'WARNING',
  [LV_NOTICE]: 'NOTICE',
  [LV_INFO]: 'INFO',
  [LV_DEBUG]: 'DEBUG',
}

const LOG_COLOR: Record<number, string> = {
  [LV_EMERGENCY]: '\x1b[91m', // rojo brillante
  [LV_ALERT]: '\x1b[31m', // rojo
  [LV_CRITICAL]: '\x1b[35m', // magenta
  [LV_ERROR]: '\x1b[91m', // rojo brillante (igual que emergency)
  [LV_WARNING]: '\x1b[33m', // amarillo
  [LV_NOTICE]: '\x1b[92m', // verde claro
  [LV_INFO]: '\x1b[34m', // azul
  [LV_DEBUG]: '\x1b[90m', // gris
  [LV_OFF]: '\x1b[0m', // reset
}

const logPath = 'tmp/logs/'

const config: {
  logLevel: number
  logPrint: boolean
  logDays: number
} = {
  logLevel: process.env.LOG_LEVEL ? Number(process.env.LOG_LEVEL) : LV_DEBUG,
  logPrint: process.env.LOG_PRINT === 'true',
  logDays: process.env.LOG_DAYS ? Number(process.env.LOG_DAYS) : 7,
}

export async function logEmergency(msg: string | object, e?: unknown): Promise<void> {
  if (LV_EMERGENCY > config.logLevel) return
  await save(LV_EMERGENCY, msg, e)
}

export async function logAlert(msg: string | object, e?: unknown): Promise<void> {
  if (LV_ALERT > config.logLevel) return
  await save(LV_ALERT, msg, e)
}

export async function logCritical(msg: string | object, e?: unknown): Promise<void> {
  if (LV_CRITICAL > config.logLevel) return
  await save(LV_CRITICAL, msg, e)
}

export async function logError(msg: string | object, e?: unknown): Promise<void> {
  if (LV_ERROR > config.logLevel) return
  await save(LV_ERROR, msg, e)
}

export async function logWarning(msg: string | object, e?: unknown): Promise<void> {
  if (LV_WARNING > config.logLevel) return
  await save(LV_WARNING, msg, e)
}

export async function logNotice(msg: string | object, e?: unknown): Promise<void> {
  if (LV_NOTICE > config.logLevel) return
  await save(LV_NOTICE, msg, e)
}

export async function logInfo(msg: string | object, e?: unknown): Promise<void> {
  if (LV_INFO > config.logLevel) return
  await save(LV_INFO, msg, e)
}

export async function logDebug(msg: string | object, e?: unknown): Promise<void> {
  if (LV_DEBUG > config.logLevel) return
  await save(LV_DEBUG, msg, e)
}

export async function logPrint(msg: string | object, e?: unknown): Promise<void> {
  await save(LV_OFF, msg, e)
}

async function save(lv: number, msg: string | object, e?: unknown): Promise<void> {
  if (typeof msg === 'object') {
    msg = JSON.stringify(msg)
  } else {
    msg = String(msg).replace(/[\r\n"\\]/g, '')
  }

  const time = new Date().toISOString()
  const level = LOG_LEVEL[lv]
  const err = dumpError(e)

  if (config.logPrint) {
    console.log(`${time} [${LOG_COLOR[lv]}${level}${LOG_COLOR[RESET]}] ${msg}\n${err}`)
  }

  const data = `{"time":"${time}","level":"${level}","message":"${msg}","error":"${err}"}\n`
  const date = new Date().toISOString().slice(0, 10)
  const fileName = `${logPath}${date}.log`
  await appendFile(fileName, data, 'utf8')
}

function dumpError(e?: unknown): string {
  if (e instanceof Error) {
    const result: Record<string, unknown> = {}

    const ownKeys = Object.getOwnPropertyNames(e)
    for (const key of ownKeys) {
      try {
        result[key] = (e as any)[key]
      } catch {
        result[key] = '[No pudimos leer esto]'
      }
    }

    let proto = Object.getPrototypeOf(e)
    while (proto && proto !== Object.prototype && proto !== Error.prototype) {
      const protoKeys = Object.getOwnPropertyNames(proto)
      for (const key of protoKeys) {
        if (!result[key] && key !== 'constructor') {
          try {
            result[key] = (e as any)[key]
          } catch {
            result[key] = '[No pudimos leer esto]'
          }
        }
      }
      proto = Object.getPrototypeOf(proto)
    }

    result._className = e.constructor.name
    return JSON.stringify(result)
  }
  return ''
}

async function cleanOldLogs(): Promise<void> {
  try {
    const files = await readdir(logPath)
    const today = new Date()
    const cutoffDate = new Date(today)
    cutoffDate.setDate(cutoffDate.getDate() - config.logDays)
    const cutoffStr = cutoffDate.toISOString().slice(0, 10)

    for (const file of files) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})\.log$/)
      if (!match) continue

      const fileDate = match[1]
      if (fileDate! < cutoffStr) {
        await unlink(join(logPath, file))
        console.log(`Log eliminado: ${file}`)
      }
    }
  } catch (error) {
    console.error('Error limpiando logs:', error)
  }
  setTimeout(cleanOldLogs, 86400000)
}

cleanOldLogs()
