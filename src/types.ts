
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
  encrypt: (key: Buffer, type: KeyTypes, toEncrypt: Buffer) => Promise<Buffer>,

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

/**
 * Interface for operations relying on an encrypted Wallet representation.
 *
 * This interface represents a set of pure functions for operations which require
 * a state which should be kept encrypted.
 */ 
export interface EncryptedWalletUtils {

  /**
   * Returns an empty encrypted wallet with the given id
   * The ID is used for Additional Authenticated Data and is required for decryption of the wallet
   * @param id - id to assign to the wallet
   * @param pass - password to encrypt the wallet
   * @returns base64 encoded, xChaCha20Poly1305-encrypted wallet
   */
  newWallet: (
    id: string,
    pass: string
  ) => Promise<string>,

  /**
   * Returns an encrypted wallet with the same contents but a new password
   * @param encryptedWallet - id to assign to the wallet
   * @param id - id to assign to the wallet
   * @param pass - password to encrypt the wallet
   * @returns base64 encoded, xChaCha20Poly1305-encrypted wallet
   */ 
  changePass: (
    encryptedWallet: string,
    id: string,
    oldPass: string,
    newPass: string
  ) => Promise<string>,

  /**
   * Returns an encrypted wallet with same contents but a new ID
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param newId - new id to assign to the wallet
   * @param pass - password to decrypt the wallet
   * @returns encrypted wallet state with new ID, base64-url encoded
   */ 
  changeId: (
    encryptedWallet: string,
    id: string,
    newId: string,
    pass: string
  ) => Promise<string>,

  /**
   * Generates a new key of a particular type and adds it to the encrypted wallet
   * NOTE: controller is intended to represent an external reference to a
   * verification method for which this key pair is used e.g. `did:jolo:12345#keys-1`.
   * Controller values SHOULD NOT be duplicated within the wallet, or the `byController`
   * API may become inconsistant.
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param keyType - Type of key pair to generate
   * @param controller - Optional controller value to add to new key pair's controller list
   * @returns encrypted wallet state with added key pair, base64-url encoded
   */ 
  newKey: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyType: string,
    controller?: string
  ) => Promise<string>,

  /**
   * Imports a content item into the encrypted wallet.
   * See the UniversalWallet2020 spec for which content types should be supported
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param content - content item to be added, as stringified JSON
   * @returns encrypted wallet state with added content, base64-url encoded
   */ 
  addContent: (
    encryptedWallet: string,
    id: string,
    pass: string,
    content: string
  ) => Promise<string>,
  
  /**
   * Retreives public key information from the encrypted wallet's contents
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param keyRef - URN identifier of the key in the wallet
   * @returns Public key content item as stringified JSON
   */ 
  getKey: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string
  ) => Promise<string>,

  /**
   * Retreives public key information from the encrypted wallet's contents based on the Controller value
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param controller - controller value to search keys by
   * @returns Public key content item as stringified JSON
   */ 
  getKeyByController: (
    encryptedWallet: string,
    id: string,
    pass: string,
    controller: string
  ) => Promise<string>,

  /**
   * Sets the value of the Controller field for a given key in the encrypted wallet
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param keyRef - URN identifier of the key in the wallet
   * @param controller - controller value to set on the key
   * @returns encrypted wallet state with updated content, base64-url encoded
   */ 
  setKeyController: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string,
    controller: string
  ) => Promise<string>,
  
  /**
   * Returns all public key material in the wallet
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @returns List of PublicKeyInfo content items as stringified JSON
   */ 
  getKeys: (
    encryptedWallet: string,
    id: string,
    pass: string
  ) => Promise<string>,

  /**
   * Signs the given data with the referenced key
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param keyRef - URN of key to use for signing
   * @param data - data to sign
   * @returns Signature, base64-url encoded
   */ 
  sign: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string,
    data: string,
  ) => Promise<string>,

  /**
   * Decrypts the given ciphertext using the referenced key
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param keyRef - URN of key to use for decryption
   * @param ciphertext - ciphertext to decrypt
   * @returns Plaintext, base64-url
   */ 
  decrypt: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string,
    ciphertext: string,
  ) => Promise<string>,

  /**
   * Performs ECDH Key Agreement with the referenced key and the given public key
   * @param encryptedWallet - encrypted wallet data, base64-url encoded
   * @param id - id of the wallet
   * @param pass - password to decrypt the wallet
   * @param keyRef - controller of private key to use for ECDH
   * @param pubKey - public key to perform ECDH with
   * @returns Plaintext, base64-url
   */ 
  ecdhKeyAgreement: (
    encryptedWallet: string,
    id: string,
    pass: string,
    keyRef: string,
    pubKey: string
  ) => Promise<string>
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
  ) => Promise<string>
};
