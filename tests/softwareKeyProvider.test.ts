import { SoftwareKeyProvider, KeyTypes, getCryptoProvider } from "../src";

// Testing against a specific implementation
import { walletUtils, getIcp, cryptoUtils } from '@jolocom/native-core'

const id = "my_wallet_id"
const id2 = "my_other_wallet_id"
const p1 = "password 1"
const p2 = "password 2"
const verifySignature = getCryptoProvider(cryptoUtils).verify

describe("Software Key Provider", () => {
  test("It should create a new empty wallet and add a key", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )

    const enc_str = wallet.encryptedWallet
    expect(!!enc_str).toEqual(true)
    
    const keys0 = await wallet.getPubKeys(p1)
    
    // Should correctly add key with preset controller
    expect(keys0.length).toEqual(0)
    const newKey = await wallet.newKeyPair(
      p1,
      KeyTypes.ecdsaSecp256k1VerificationKey2019,
      `${id}#key-1`
    )
    
    // Should correctly add key without controller
    const secondNewKey = await wallet.newKeyPair(
      p1,
      KeyTypes.ecdsaSecp256k1VerificationKey2019,
    )

    expect(enc_str).not.toEqual(wallet.encryptedWallet)
    
    const keys = await wallet.getPubKeys(p1)
    
    expect(keys.length).toEqual(2)
    await expect(wallet.getPubKey({keyRef: newKey.id, encryptionPass: p1})).resolves.toEqual(newKey)
    await expect(wallet.getPubKey({keyRef: secondNewKey.id, encryptionPass: p1})).resolves.toMatchObject(secondNewKey)

    await expect(wallet.getPubKeyByController(p1, `${id}#key-1`)).resolves.toEqual(newKey)
    await expect(wallet.getPubKeyByController(p1, secondNewKey.controller[0])).resolves.toMatchObject(secondNewKey)
    await expect(wallet.getPubKeyByController(p1, "not a real controller")).rejects.toBeTruthy()
  });

  test("It should correctly change the vault ID", async () => {
    const initialId = 'oldId'
    const changedId = 'newId'
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      initialId,
      p1
    )

    expect(wallet.id).toBe(initialId)
    await wallet.changeId(p1, changedId)
    expect(wallet.id).toBe(changedId)
  })
  
  test("It should create a new empty wallet and add the supported content entries", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )
    
    await wallet.addContent(
      p1,
      {
        type: ["TestEntropy"],
        value: "Gf6rvA=="
      }
    )

    const mockKeyEntry = {
        controller: [`${wallet.id}#test-key`],
        type: KeyTypes.ecdsaSecp256k1VerificationKey2019,
        publicKeyHex: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01"
    }

    await wallet.addContent(
      p1,
      { ...mockKeyEntry,
        private_key: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      }
    )

    const keys = await wallet.getPubKeys(p1)
    expect(keys.length).toEqual(1)
    expect(keys[0]).toMatchObject(mockKeyEntry)
  });

  test("It should correctly change the controller for a key", async () => {
    const intialController = `${id}#key-1`
    const newController = `${id}signing`

    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )

    await wallet.newKeyPair(
      p1,
      KeyTypes.ecdsaSecp256k1VerificationKey2019,
      intialController
    )

    const key = await wallet.getPubKeyByController(
      p1,
      intialController
    )

    expect(key).toBeDefined()

    await wallet.setKeyController({
      encryptionPass: p1,
      keyRef: key.id
    }, newController)

    await expect(wallet.getPubKeyByController(
      p1,
      intialController
    )).rejects.toBeTruthy()

    expect(await wallet.getPubKeyByController(
      p1,
      newController
    )).toBeDefined
  })

  test("It should incept a keri ID", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )

    await getIcp({encryptedWallet: wallet.encryptedWallet, id: id, pass: p1})
  })
  
  test("It should sign using secp256k1 and ed25519", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )

    const edKey = await wallet.newKeyPair(
      p1,
      KeyTypes.ed25519VerificationKey2018,
      `${id}#key-1`
    )

    const secpKey = await wallet.newKeyPair(
      p1,
      KeyTypes.ecdsaSecp256k1VerificationKey2019,
      `${id}#key-2`
    )
    
    const secpRecovKey = await wallet.newKeyPair(
      p1,
      KeyTypes.ecdsaSecp256k1RecoveryMethod2020,
      `${id}#key-3`
    )
    
    const message = Buffer.from("hello there")
    
    const edSig = await wallet.sign({
      encryptionPass: p1,
      keyRef: edKey.controller[0]
    }, message)

    const secpSig = await wallet.sign({
      encryptionPass: p1,
      keyRef: secpKey.controller[0]
    }, message)

    const recoverableSig = await wallet.sign({
      encryptionPass: p1,
      keyRef: secpRecovKey.controller[0]
    }, message)


    expect(await verifySignature(Buffer.from(edKey.publicKeyHex, 'hex'), edKey.type, message, edSig)).toBe(true)
    expect(await verifySignature(Buffer.from(secpKey.publicKeyHex, 'hex'), secpKey.type, message, secpSig)).toBe(true)
    expect(await verifySignature(Buffer.from(secpRecovKey.publicKeyHex, 'hex'), secpRecovKey.type, message, recoverableSig)).toBe(true)

    expect(await verifySignature(Buffer.from(secpKey.publicKeyHex, 'hex'), secpKey.type, message.slice(1), secpSig)).toBe(false)
    expect(await verifySignature(Buffer.from(edKey.publicKeyHex, 'hex'), edKey.type, message.slice(1), edSig)).toBe(false)
    expect(await verifySignature(Buffer.from(secpRecovKey.publicKeyHex, 'hex'), secpRecovKey.type, message.slice(1), recoverableSig)).toBe(false)
  })
  
  test("It should change password", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )
    const enc_str = wallet.encryptedWallet
    expect(!!enc_str).toEqual(true)
    
    await wallet.changePass(p1, p2);
    
    expect(enc_str).not.toEqual(wallet.encryptedWallet)
    await expect(wallet.getPubKeys(p1)).rejects.toThrow()
    
    await expect(wallet.getPubKeys(p2)).resolves.toEqual([])
  });  
 
  test("It should change id", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )
    const enc_str = wallet.encryptedWallet
    expect(!!enc_str).toEqual(true)

    expect(wallet.id).toEqual(id)
    expect(wallet.id).not.toEqual(id2)
    
    await wallet.changeId(p1, id2);
    
    expect(enc_str).not.toEqual(wallet.encryptedWallet)

    expect(wallet.id).not.toEqual(id)
    expect(wallet.id).toEqual(id2)

    await expect(wallet.getPubKeys(p1)).resolves.toEqual([])
  });

  test("It should decrypt", async () => {
    const crp = getCryptoProvider(cryptoUtils)
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )
    const message = Buffer.from("hello there")

    const newKey = await wallet.newKeyPair(
      p1,
      KeyTypes.x25519KeyAgreementKey2019,
    )

    const encryptedMessage = await crp.encrypt(Buffer.from(newKey.publicKeyHex, 'hex'), KeyTypes.x25519KeyAgreementKey2019, message)

    const decryptedMessage = await wallet.decrypt({ encryptionPass: p1, keyRef: newKey.controller[0] }, encryptedMessage)

    expect(decryptedMessage).toEqual(message)
  })

  test("It should perform ECDH", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1,
    )
    const newKey = "ecdh_key"

    // test vector from rfc7748 6.1
    const keyContent = {
      controller: [newKey],
      type: "X25519KeyAgreementKey2019",
      publicKeyHex: "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a",
      privateKeyHex: "77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a"
    }

    const ref = {
      encryptionPass: p1,
      keyRef: newKey
    }
    
    await wallet.addContent(p1, keyContent)

    const testPubKey = Buffer.from("de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f", 'hex')
    await expect(wallet.ecdhKeyAgreement(ref, testPubKey)).resolves.toEqual(Buffer.from("4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742", 'hex'))
  })
});
