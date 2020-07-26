import { CryptoUtils, PublicKeyInfo, ICryptoProvider } from './types'
import base64url from 'base64url' 

export const getCryptoProvider = (
  u: CryptoUtils
): ICryptoProvider => ({
  verify: async (
    pkInfo: PublicKeyInfo,
    data: Buffer,
    sig: Buffer
  ): Promise<boolean> => await u.verify(
    JSON.stringify(pkInfo),
    data.encode(toEncrypt),
    sig.encode(toEncrypt),
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
