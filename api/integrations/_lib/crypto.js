// AES-256-GCM helpers for encrypting OAuth tokens at rest.
// Uses Node's built-in crypto. Key is TOKEN_ENCRYPTION_KEY (hex, 64 chars = 32 bytes).
import crypto from 'node:crypto'

const ALG = 'aes-256-gcm'

function getKey() {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY env var missing or wrong length (need 32 bytes hex = 64 chars). Generate with: openssl rand -hex 32')
  }
  return Buffer.from(hex, 'hex')
}

export function encryptToken(plainText) {
  if (!plainText) return null
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALG, key, iv)
  const enc = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv.tag.ciphertext all in base64, joined by '.'
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.')
}

export function decryptToken(blob) {
  if (!blob) return null
  const parts = blob.split('.')
  if (parts.length !== 3) throw new Error('Invalid encrypted token format')
  const [ivB64, tagB64, ctB64] = parts
  const key = getKey()
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const ct = Buffer.from(ctB64, 'base64')
  const decipher = crypto.createDecipheriv(ALG, key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(ct), decipher.final()])
  return dec.toString('utf8')
}

// Random state for OAuth CSRF protection
export function generateState() {
  return crypto.randomBytes(16).toString('hex')
}
