/*
 * Genera un nuevo token hexadecimal aleatorio de 32 caracteres
 */
export function hexToken(): string {
  const bytes = new Uint8Array(16) // 16 bytes = 32 caracteres hex
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
