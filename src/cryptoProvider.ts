import { KeyTypes, CryptoUtils, ICryptoProvider } from './types'
import { base64url } from 'rfc4648'

/**
 * Wraps a CryptoUtils implementation object to return an object implementing ICryptoProvider 
 * @param utils - crypto function implementations required to perform necessary crypto ops
 */
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
  ).catch((e) => {
    /* 
     * TODO Currently the ed25519 verification fn in rust throws in case verification fails
     * which is inconsistent with the secp256k1 behaviour.
     */

    return false
  }),

  encrypt: async (
    key: Buffer,
    type: KeyTypes,
    toEncrypt: Buffer,
  ): Promise<Buffer> => Buffer.from(
    await u.encrypt(
      base64url.stringify(key),
      type,
      base64url.stringify(toEncrypt),
    ), 'base64'),
    
  getRandom: async (
    nr: number
  ): Promise<Buffer> => {
    if (nr < 0) {
      throw new Error('Only positive values for N allowed')
    }

    return Buffer.from(await u.getRandom(nr), 'base64')
  }
})
