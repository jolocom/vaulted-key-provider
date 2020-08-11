import { KeyTypes, CryptoUtils, PublicKeyInfo, ICryptoProvider } from './types'
import { base64url } from 'rfc4648'

export const getCryptoProvider = (
  u: CryptoUtils
): ICryptoProvider => ({
  verify: async (
    key: Buffer,
    type: KeyTypes,
    data: Buffer,
    sig: Buffer
  ): Promise<boolean> => await u.verify(
    base64url.stringify(key),
    type,
    base64url.stringify(data),
    base64url.stringify(sig),
  ),

  encrypt: async (
    pkInfo: PublicKeyInfo,
    toEncrypt: Buffer,
    aad?: Buffer
  ): Promise<Buffer> => Buffer.from(await u.encrypt(
    JSON.stringify(pkInfo),
    base64url.stringify(toEncrypt),
    aad ? base64url.stringify(aad) : undefined
  ), 'base64'),
    
  getRandom: async (
    nr: number
  ): Promise<Buffer> => Buffer.from(
    await u.getRandom(nr),
    'base64'
  ),
})
