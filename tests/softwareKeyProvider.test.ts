import { SoftwareKeyProvider, KeyTypes } from "../src";
import base64url from 'base64url' 

// Testing against a specific implementation
import { walletUtils } from '@jolocom/native-utils-node'

const id = "my_wallet_id"
const p1 = "password 1"
const p2 = "password 2"

describe("Software Key Provider", async () => {
  test("It should create a new empty wallet and add a key", async () => {
    const wallet = await SoftwareKeyProvider.newEmptyWallet(
      walletUtils,
      id,
      p1
    )
    const enc_str = wallet.encryptedWallet
    expect(!!enc_str).toEqual(true)
    
    const keys0 = await wallet.getPubKeys(p1)
    
    expect(keys0.length).toEqual(0)
    
    const newKey = await wallet.newKeyPair(
      p1,
      KeyTypes.ecdsaSecp256k1VerificationKey2019,
      `${id}#key-1`
    )
    
    expect(enc_str).not.toEqual(wallet.encryptedWallet)
    
    const keys = await wallet.getPubKeys(p1)
    
    expect(keys.length).toEqual(1)
    
    expect(keys[0]).toEqual(newKey)
  });
  
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
      keyRef: newKey.id
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
    expect(wallet.getPubKeys(p1)).rejects.toThrow()
    
    expect(wallet.getPubKeys(p2)).resolves.toEqual([])
  });  
});
