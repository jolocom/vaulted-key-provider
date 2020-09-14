
export interface IKeyRefArgs {
  encryptionPass: string,
  keyRef: string,
};

export interface AddKeyResult {
  newEncryptedState: string,
  newKey: PublicKeyInfo
}

export enum KeyTypes {
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
  getPubKeyByController: (pass: string, controller: string) => Promise<PublicKeyInfo>,
  getPubKeys: (pass: string) => Promise<PublicKeyInfo[]>,
  sign: (refArgs: IKeyRefArgs, data: Buffer) => Promise<Buffer>,
  decrypt: (refArgs: IKeyRefArgs, data: Buffer) => Promise<Buffer>,
  newKeyPair: (pass: string, keyType: KeyTypes, controller?: string) => Promise<PublicKeyInfo>
};

/**
 * Interface for operations which do not require private key material
 */
export interface ICryptoProvider {

  /**
   * Verifies a given signature with a given public key
   * @param key - Public key material to verify with
   * @param type - Type of verification suite to use
   * @param data - Data to verify against
   * @param sig - Signature material to verify
   * @returns result of applying verification method of `type` with `key`, `data` and `signature`
   */
  verify: (key: Buffer, type: KeyTypes, data: Buffer, sig: Buffer) => Promise<boolean>,

  /**
   * Anon-crypts data to a given public key
   * NOTE: implementations may provide anoncryption schemes which differ in their implementation and may not be compatible.
   * @param key - Public key material to perform Key Agreement with
   * @param type - Type of Key Agreement to use
   * @param toEncrypt - Plaintext to encrypt
   * @returns ciphertext result of performing Key Agreement and Symmetrical encryption of `type` with `key` and `toEncrypt`
   */
  encrypt: (key: Buffer, type: KeyTypes, toEncrypt: Buffer, aad?: Buffer) => Promise<Buffer>,

  /**
   * Creates a buffer of random bytes
   * @param nr - length of buffer desired
   * @returns Buffer of `nr` random bytes
   */
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

  addContent: (
    encryptedWallet: string,
    id: string,
    pass: string,
    content: string
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

  setKeyController: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string,
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

  /**
   * Creates a buffer of random bytes
   * @param nr - length of buffer desired
   * @returns `nr` bytes of random entropy, base64-url encoded
   */
  getRandom: (
    len: number
  ) => Promise<string>,

  /**
   * Verifies a given signature with a given public key
   * @param key - Public key material to verify with, base64-url encoded
   * @param type - Type of verification suite to use
   * @param data - Data to verify against, base64-url encoded
   * @param sig - Signature material to verify, base64-url encoded
   * @returns result of applying verification method of `type` with `key`, `data` and `signature`
   */
  verify: (
    key: string,
    type: string,
    data: string,
    sig: string
  ) => Promise<boolean>,

  /**
   * Anon-crypts data to a given public key
   * @param key - Public key material to perform Key Agreement with, base64-url encoded
   * @param type - Type of Key Agreement to use
   * @param toEncrypt - Plaintext to encrypt, base64-url encoded
   * @returns ciphertext result of performing Key Agreement and Symmetrical encryption of `type` with `key` and `toEncrypt`, base64-url encoded
   */
  encrypt: (
    key: string,
    type: string,
    toEncrypt: string,
    aad?: string
  ) => Promise<string>
};
