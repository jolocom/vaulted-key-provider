import { CryptoUtils, PublicKeyInfo, ICryptoProvider } from './types'

export const getCryptoProvider = (
  u: CryptoUtils
): ICryptoProvider => ({
  verify: async (
    pkInfo: PublicKeyInfo,
    data: Buffer,
    sig: Buffer
  ): Promise<boolean> => await u.verify(
    JSON.stringify(pkInfo),
    data.toString('base64'),
    sig.toString('base64')
  ),

  encrypt: async (
    pkInfo: PublicKeyInfo,
    toEncrypt: Buffer,
    aad?: Buffer
  ): Promise<Buffer> => Buffer.from(await u.encrypt(
    JSON.stringify(pkInfo),
    toEncrypt.toString('base64'),
    aad ? aad.toString('base64') : undefined
  ), 'base64'),
    
  getRandom: async (
    nr: number
  ): Promise<Buffer> => Buffer.from(
    await u.getRandom(nr),
    'base64'
  ),
})
