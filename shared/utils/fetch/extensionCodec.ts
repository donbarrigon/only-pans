import { decode, encode, ExtensionCodec } from '@msgpack/msgpack'
import { ObjectId } from 'mongodb'

export const extensionCodec = new ExtensionCodec()

// Registrar manejo de fechas (tipo 0)
extensionCodec.register({
  type: 0,
  encode: (input: unknown) => {
    if (input instanceof Date) {
      const buffer = new ArrayBuffer(8)
      const view = new DataView(buffer)
      view.setFloat64(0, input.getTime())
      return new Uint8Array(buffer)
    }
    return null
  },
  decode: (data: Uint8Array) => {
    const view = new DataView(data.buffer)
    const timestamp = view.getFloat64(0)
    return new Date(timestamp)
  },
})

// Registrar manejo de ObjectId (tipo 1)
extensionCodec.register({
  type: 1,
  encode: (input: unknown) => {
    if (input instanceof ObjectId) {
      // Convertir a string hexadecimal (24 caracteres)
      const hexString = input.toHexString()
      return new TextEncoder().encode(hexString)
    }
    return null
  },
  decode: (data: Uint8Array) => {
    // Reconstruir ObjectId desde el string
    const hexString = new TextDecoder().decode(data)
    return new ObjectId(hexString)
  },
})

// Registrar manejo de Sets (tipo 2)
extensionCodec.register({
  type: 2,
  encode: (input: unknown) => {
    if (input instanceof Set) {
      // Convertir el Set a array y codificarlo
      const array = Array.from(input)
      return encode(array, { extensionCodec })
    }
    return null
  },
  decode: (data: Uint8Array) => {
    // Decodificar el array y convertirlo de vuelta a Set
    const array = decode(data, { extensionCodec }) as unknown[]
    return new Set(array)
  },
})
