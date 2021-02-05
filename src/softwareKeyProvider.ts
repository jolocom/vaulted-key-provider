import {
  IKeyRefArgs,
  IVaultedKeyProvider,
  EncryptedWalletUtils,
  PublicKeyInfo,
  KeyTypes,
  AddKeyResult
} from './types'
import { base64url } from 'rfc4648'

export class SoftwareKeyProvider implements IVaultedKeyProvider {
  private _encryptedWallet: Buffer
  private _id: string
  private readonly _utils: EncryptedWalletUtils

  /**
   * Initializes the vault with an already xChaCha20Poly1305 encrypted wallet
   * @param utils - crypto function implementations required to perform necessary wallet ops
   * @param encryptedWallet - the wallet ciphertext, xChaCha20Poly1305 encrypted
   * @param id - the id, linked to the ciphertext as its aad
   */
  public constructor(utils: EncryptedWalletUtils, encryptedWallet: Buffer, id: string) {
    this._id = id
    this._encryptedWallet = encryptedWallet
    this._utils = utils
  }

  /**
   * Initializes an empty vault
   * @param utils - crypto function implementations required to perform necessary wallet ops
   * @param id - the id, linked to the ciphertext as its aad
   * @param pass - the initial password to encrypt the wallet
   */
  public static async newEmptyWallet(
    utils: EncryptedWalletUtils,
    id: string,
    pass: string
  ): Promise<SoftwareKeyProvider> {
    const emptyWallet = Buffer.from(await utils.newWallet(id, pass), 'base64')
    return new SoftwareKeyProvider(utils, emptyWallet, id)
  }

  /**
   * Get the encrypted wallet base64 base64url.stringifyd
   */
  public get encryptedWallet(): string {
    // NOTE base64_URL_ encoding is used here, so  this uses an external lib for encoding 
    return base64url.stringify(this._encryptedWallet)
  }

  /**
   * Get the wallet id
   */
  public get id(): string {
    return this._id
  }

  /**
   * Changes the password encrypting the wallet
   * @param pass - Old password for wallet decryption
   * @param newPass - New password for wallet decryption
   * @example `await vault.changePass(...) Promise<void> <...>`
   */
  public async changePass(
    pass: string,
    newPass: string
  ): Promise<void> {
    this._encryptedWallet = Buffer.from(await this._utils.changePass(
      this.encryptedWallet,
      this.id,
      pass,
      newPass
    ), 'base64')
  }

  /**
   * Changes the id associated with the encrypted wallet
   * @param pass - Password for wallet decryption
   * @param newId - New password for wallet decryption
   * @example `await vault.changeId(...) Promise<void> <...>`
   */
  public async changeId(
    pass: string,
    newId: string
  ): Promise<void> {
    this._encryptedWallet = Buffer.from(await this._utils.changeId(
      this.encryptedWallet,
      this.id,
      newId,
      pass,
    ), 'base64')
    this._id = newId
  }
  
  /**
   * Adds a key pair of the given type to the encrypted wallet
   * @param pass - Password for wallet decryption
   * @param keyType - type of key pair to be added
   * @param controller - optional controller arguement to add to key info
   * @example `await vault.newKeyPair(pass, keyType, controller?) Promise<PublicKeyInfo> <...>`
   */

  public async newKeyPair(
    pass: string,
    keyType: KeyTypes,
    controller?: string
  ): Promise<PublicKeyInfo> {
    const res_str = await this._utils.newKey(
        this.encryptedWallet,
        this.id,
        pass,
        keyType,
        controller
    )

    const res = JSON.parse(res_str) as AddKeyResult
    this._encryptedWallet = Buffer.from(res.newEncryptedState, 'base64')

    return res.newKey
  }

  /**
   * Adds content to the wallet
   * NOTE - Hex strings passed in should not be 0x prefixed, otherwise
   * an error occurs.
   * TODO Fix / handle this
   * @param pass - Password for wallet decryption
   * @param content - content to be added
   * @example `await vault.addContent(pass, {...}) Promise<void>`
   */
  public async addContent(
    pass: string,
    content: any
  ): Promise<void> {
    this._encryptedWallet = Buffer.from(await this._utils.addContent(
      this.encryptedWallet,
      this.id,
      pass,
      JSON.stringify(content)
    ), 'base64')
  }

  /**
   * Returns public key from the wallet if present
   * @param refArgs - Password for wallet decryption and ref path
   * @example `await vault.getPubKey({keyRef: ..., encryptionPass: ...}) Promise<PublicKeyInfo> <...>`
   */
  public async getPubKey({
    encryptionPass,
    keyRef
  }: IKeyRefArgs): Promise<PublicKeyInfo> {
    return JSON.parse(await this._utils.getKey(
      this.encryptedWallet,
      this.id,
      encryptionPass,
      keyRef
    )) as PublicKeyInfo
  }

  /**
   * Returns public key from the wallet if present
   * @param pass - Password for wallet decryption
   * @param controller - controller to search for in keyset
   * @example `await vault.getPubKeyByController(...) Promise<PublicKeyInfo> <...>`
   */
  public async getPubKeyByController(pass: string, controller: string): Promise<PublicKeyInfo> {
    return JSON.parse(await this._utils.getKeyByController(
      this.encryptedWallet,
      this.id,
      pass,
      controller
    )) as PublicKeyInfo
  }

  /**
   * Sets the controller of a key pair
   * @param refArgs - Password for wallet decryption and ref path
   * @param controller - controller of the key
   * @example `await vault.getPubKeyByController(...) Promise<PublicKeyInfo> <...>`
   */
  public async setKeyController({
    encryptionPass,
    keyRef
  }: IKeyRefArgs, controller: string): Promise<void> {
    this._encryptedWallet = Buffer.from(await this._utils.setKeyController(
      this.encryptedWallet,
      this.id,
      encryptionPass,
      keyRef,
      controller
    ), 'base64')
  }

  /**
   * Returns all public keys from the wallet
   * @param pass - Password for wallet decryption
   * @example `await vault.getPubKeys(pass) // Promise<PublicKeyInfo[]> <...>`
   */
  public async getPubKeys(pass: string): Promise<PublicKeyInfo[]> {
    return JSON.parse(await this._utils.getKeys(
      this.encryptedWallet,
      this.id,
      pass
    )) as PublicKeyInfo[]
  }

  /**
   * Computes signature given a data buffer
   * @param refArgs - Password for wallet decryption and ref path
   * @param data - The data to sign
   * @example `await vault.sign({keyRef: ..., decryptionPass: ...}, Buffer <...>) // Promise<Buffer> <...>`
   */
  public async sign(
    refArgs: IKeyRefArgs,
    data: Buffer
  ): Promise<Buffer> {
    const { encryptionPass, keyRef } = refArgs
    return Buffer.from(await this._utils.sign(
      this.encryptedWallet,
      this.id,
      encryptionPass,
      keyRef,
      base64url.stringify(data)
    ), 'base64')
  }

  /**
   * Decrypts given data using the ref args and optional additional authenticated data
   * @param refArgs - Password for wallet decryption and ref path
   * @param data - The data to decrypt. format depends on referenced key type
   * @example `await vault.decrypt({keyRef: ..., decryptionPass: ...}, Buffer <...>) // Promise<Buffer> <...>`
   */
  public async decrypt(
    refArgs: IKeyRefArgs,
    data: Buffer,
  ): Promise<Buffer> {
    return Buffer.from(await this._utils.decrypt(
      this.encryptedWallet,
      this.id,
      refArgs.encryptionPass,
      refArgs.keyRef,
      base64url.stringify(data),
    ), 'base64')
  }

  /**
   * Decrypts given data using the ref args and optional additional authenticated data
   * @param refArgs - Password for wallet decryption and ref path
   * @param pubKey - The public key to use for ECDH
   * @example `await vault.ecdhKeyAgreement({keyRef: ..., decryptionPass: ...}, Buffer <...>) // Promise<Buffer> <...>`
   */
  public async ecdhKeyAgreement(
    refArgs: IKeyRefArgs,
    pubKey: Buffer,
  ): Promise<Buffer> {
    return Buffer.from(await this._utils.decrypt(
      this.encryptedWallet,
      this.id,
      refArgs.encryptionPass,
      refArgs.keyRef,
      base64url.stringify(pubKey),
    ), 'base64')
  }
}
