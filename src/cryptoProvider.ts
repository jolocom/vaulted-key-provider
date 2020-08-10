import { KeyTypes, CryptoUtils, PublicKeyInfo, ICryptoProvider } from './types'
import base64url from 'base64url' 

export const getCryptoProvider = (
  u: CryptoUtils
): ICryptoProvider => ({
  verify: async (
    key: Buffer,
    type: KeyTypes,
    data: Buffer,
    sig: Buffer
  ): Promise<boolean> => await u.verify(
    base64url.encode(key),
    type,
    base64url.encode(data),
    base64url.encode(sig),
  ),

  encrypt: async (
    pkInfo: PublicKeyInfo,
    toEncrypt: Buffer,
    aad?: Buffer
  ): Promise<Buffer> => Buffer.from(await u.encrypt(
    JSON.stringify(pkInfo),
    base64url.encode(toEncrypt),
    aad ? base64url.encode(aad) : undefined
  ), 'base64'),
    
  getRandom: async (
    nr: number
  ): Promise<Buffer> => Buffer.from(
    await u.getRandom(nr),
    'base64'
  ),
})
