import {
  IKeyRefArgs,
  IVaultedKeyProvider,
  EncryptedWalletUtils,
  PublicKeyInfo,
  KeyTypes,
  AddKeyResult
} from './types'

export class SoftwareKeyProvider implements IVaultedKeyProvider {
  private _encryptedWallet: Buffer
  private readonly _id: string
  private readonly _utils: EncryptedWalletUtils

  /**
   * Initializes the vault with an already encrypted aes 256 cbc seed
   * @param utils - crypto function implementations required to perform necessary wallet ops
   * @param encryptedWallet - the wallet ciphertext, aes-256-gcm
   * @param id - the id, linked to the ciphertext as its aad
   */
  public constructor(utils: EncryptedWalletUtils, encryptedWallet: Buffer, id: string) {
    this._id = id
    this._encryptedWallet = encryptedWallet
    this._utils = utils
  }

  /**
   * Get the encrypted wallet base64 encoded
   */
  public get encryptedWallet(): string {
    return this._encryptedWallet.toString('base64')
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
    this._encryptedWallet = Buffer.from(await this._utils(
      this.encryptedWallet,
      this.id,
      pass,
      newPass
    ), 'base64')
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
    keyType: KeyType,
    controller?: string
  ): Promise<PublicKeyInfo> {
    const res = JSON.parse(controller
      ? await this._utils.newKey(
        this.encryptedWallet,
        this.id,
        pass,
        keyType
      ) : await this._utils.newKey(
        this.encryptedWallet,
        this.id,
        pass,
      )) as AddKeyResult
    this._encryptedWallet = res.newEncryptedState
    return res.newKey
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
      this.id, encryptionPass,
      data.toString('base64'),
      keyRef
    ), 'base64')
  }

  /**
   * Decrypts given data using the ref args and optional additional authenticated data
   * @param refArgs - Password for wallet decryption and ref path
   * @param data - The data to decrypt. format depends on referenced key type
   * @example `await vault.decrypt({keyRef: ..., decryptionPass: ...}, Buffer <...>, Buffer <...>) // Promise<Buffer> <...>`
   */
  public async decrypt(
    refArgs: IKeyRefArgs,
    data: Buffer,
    aad?: Buffer
  ): Promise<Buffer> {
    return Buffer.from(aad
      ? await this._utils.decrypt(
        this.encryptedWallet,
        this.id,
        refArgs.encryptionPass,
        data.toString('base64'),
        aad.toString('base64')
      ) : await this._utils.decrypt(
        this.encryptedWallet,
        this.id,
        refArgs.encryptionPass,
        data.toString('base64')
      ), 'base64')
  }
}
