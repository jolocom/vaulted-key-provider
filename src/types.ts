
export interface IKeyRefArgs {
  encryptionPass: string,
  keyRef: string,
};

export interface AddKeyResult {
  newEncryptedState: string,
  newKey: PublicKeyInfo
}

export const enum KeyTypes {
  jwsVerificationKey2020 = 'JwsVerificationKey2020',
  ecdsaSecp256k1VerificationKey2019 = 'EcdsaSecp256k1VerificationKey2019',
  ed25519VerificationKey2018 = 'Ed25519VerificationKey2018',
  gpgVerificationKey2020 = 'GpgVerificationKey2020',
  rsaVerificationKey2018 = 'RsaVerificationKey2018',
  x25519KeyAgreementKey2019 = 'X25519KeyAgreementKey2019',
  schnorrSecp256k1VerificationKey2019 = 'SchnorrSecp256k1VerificationKey2019',
  ecdsaSecp256k1RecoveryMethod2020 = 'EcdsaSecp256k1RecoveryMethod2020',
};

export interface IVaultedKeyProvider {
  getPubKey: (refArgs: IKeyRefArgs) => Promise<PublicKeyInfo>,
  getPubKeys: (pass: string) => Promise<PublicKeyInfo[]>,
  sign: (refArgs: IKeyRefArgs, data: Buffer) => Promise<Buffer>,
  decrypt: (refArgs: IKeyRefArgs, data: Buffer) => Promise<Buffer>,
};

export interface ICryptoProvider {
  verify: (pkInfo: PublicKeyInfo, data: Buffer, sig: Buffer) => Promise<boolean>,
  encrypt: (pkInfo: PublicKeyInfo, toEncrypt: Buffer, aad?: Buffer) => Promise<Buffer>,
  getRandom: (nr: number) => Promise<Buffer>,
};

export interface PublicKeyInfo {
  id: string,
  type: KeyTypes,
  publicKeyHex: string
  controller: string[]
};

export interface EncryptedWalletUtils {
  newWallet: (
    id: string,
    pass: string
  ) => Promise<string>,
  
  changePass: (
    encryptedWallet: string,
    id: string,
    oldPass: string,
    newPass: string
  ) => Promise<string>,
  
  changeId: (
    encryptedWallet: string,
    id: string,
    newId: string,
    pass: string
  ) => Promise<string>,

  newKey: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyType: string,
    controller?: string
  ) => Promise<string>,
  
  getKey: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string
  ) => Promise<string>,

  getKeyByController: (
    encryptedWallet: string,
    id: string,
    pass: string,
    controller: string
  ) => Promise<string>,
  
  getKeys: (
    encryptedWallet: string,
    id: string,
    pass: string
  ) => Promise<string>,

  sign: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string,
    data: string,
  ) => Promise<string>,

  decrypt: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string,
    data: string,
    aad?: string
  ) => Promise<string>,
};

export interface CryptoUtils {
  getRandom: (
    len: number
  ) => Promise<string>,

  verify: (
    pkInfo: string,
    data: string,
    sig: string
  ) => Promise<boolean>,

  encrypt: (
    pkInfo: string,
    toEncrypt: string,
    aad?: string
  ) => Promise<string>
};
