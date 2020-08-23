import { SoftwareKeyProvider, KeyTypes } from "../src";

// Testing against a specific implementation
import { walletUtils, getIcp } from '@jolocom/native-core-node'

const id = "my_wallet_id"
const id2 = "my_other_wallet_id"
const p1 = "password 1"
const p2 = "password 2"

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
      {type: ["TestEntropy"], value: "Gf6rvA=="}
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
  
  test("It should sign", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )
    const newKey = await wallet.newKeyPair(
      p1,
      KeyTypes.ecdsaSecp256k1VerificationKey2019,
      `${id}#key-1`
    )
    
    const message = Buffer.from("hello there")
    
    const sig = await wallet.sign({
      encryptionPass: p1,
      keyRef: newKey.controller[0]
    }, message)

    expect(sig.length).toEqual(64)
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
});
