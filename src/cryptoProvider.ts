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
    key: Buffer,
    type: KeyTypes,
    toEncrypt: Buffer,
  ): Promise<Buffer> => {
    const res = await u.encrypt(
      base64url.stringify(key),
      type,
      base64url.stringify(toEncrypt),
      ''
    )

    return Buffer.from(Buffer.from(res, 'base64'))
  },
    
  getRandom: async (
    nr: number
  ): Promise<Buffer> => {
    if (nr < 0) {
      throw new Error('Only positive values for N allowed')
    }

    return Buffer.from(await u.getRandom(nr), 'base64')
  }
})
