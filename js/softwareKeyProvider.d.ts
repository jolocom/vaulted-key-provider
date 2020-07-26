/// <reference types="node" />
import { IKeyRefArgs, IVaultedKeyProvider, EncryptedWalletUtils, PublicKeyInfo, KeyTypes } from './types';
export declare class SoftwareKeyProvider implements IVaultedKeyProvider {
    private _encryptedWallet;
    private readonly _id;
    private readonly _utils;
    /**
     * Initializes the vault with an already aes-256-gcm encrypted wallet
     * @param utils - crypto function implementations required to perform necessary wallet ops
     * @param encryptedWallet - the wallet ciphertext, aes-256-gcm
     * @param id - the id, linked to the ciphertext as its aad
     */
    constructor(utils: EncryptedWalletUtils, encryptedWallet: Buffer, id: string);
    /**
     * Initializes an empty vault
     * @param utils - crypto function implementations required to perform necessary wallet ops
     * @param id - the id, linked to the ciphertext as its aad
     * @param pass - the initial password to encrypt the wallet
     */
    static newEmptyWallet(utils: EncryptedWalletUtils, id: string, pass: string): Promise<SoftwareKeyProvider>;
    /**
     * Get the encrypted wallet base64 encoded
     */
    get encryptedWallet(): string;
    /**
     * Get the wallet id
     */
    get id(): string;
    /**
     * Changes the password encrypting the wallet
     * @param pass - Old password for wallet decryption
     * @param newPass - New password for wallet decryption
     * @example `await vault.changePass(...) Promise<void> <...>`
     */
    changePass(pass: string, newPass: string): Promise<void>;
    /**
     * Adds a key pair of the given type to the encrypted wallet
     * @param pass - Password for wallet decryption
     * @param keyType - type of key pair to be added
     * @param controller - optional controller arguement to add to key info
     * @example `await vault.newKeyPair(pass, keyType, controller?) Promise<PublicKeyInfo> <...>`
     */
    newKeyPair(pass: string, keyType: KeyTypes, controller?: string): Promise<PublicKeyInfo>;
    /**
     * Returns public key from the wallet if present
     * @param refArgs - Password for wallet decryption and ref path
     * @example `await vault.getPubKey({keyRef: ..., encryptionPass: ...}) Promise<PublicKeyInfo> <...>`
     */
    getPubKey({ encryptionPass, keyRef }: IKeyRefArgs): Promise<PublicKeyInfo>;
    /**
     * Returns all public keys from the wallet
     * @param pass - Password for wallet decryption
     * @example `await vault.getPubKeys(pass) // Promise<PublicKeyInfo[]> <...>`
     */
    getPubKeys(pass: string): Promise<PublicKeyInfo[]>;
    /**
     * Computes signature given a data buffer
     * @param refArgs - Password for wallet decryption and ref path
     * @param data - The data to sign
     * @example `await vault.sign({keyRef: ..., decryptionPass: ...}, Buffer <...>) // Promise<Buffer> <...>`
     */
    sign(refArgs: IKeyRefArgs, data: Buffer): Promise<Buffer>;
    /**
     * Decrypts given data using the ref args and optional additional authenticated data
     * @param refArgs - Password for wallet decryption and ref path
     * @param data - The data to decrypt. format depends on referenced key type
     * @example `await vault.decrypt({keyRef: ..., decryptionPass: ...}, Buffer <...>, Buffer <...>) // Promise<Buffer> <...>`
     */
    decrypt(refArgs: IKeyRefArgs, data: Buffer, aad?: Buffer): Promise<Buffer>;
}