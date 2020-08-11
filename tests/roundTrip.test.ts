import { SoftwareKeyProvider, KeyTypes, getCryptoProvider } from "../src";
import { base64url } from 'rfc4648'

// Testing against a specific implementation
import { walletUtils, cryptoUtils, getIcp } from '@jolocom/native-utils-node'

const id = "my_wallet_id"
const p1 = "password 1"

describe("Round Trip Signature", () => {
    test("It should generate and verify signatures internally consistantly", async () => {
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
        const key = Buffer.from(newKey.publicKeyHex, 'hex')
        
        const message = Buffer.from("hello there!")
        
        const sig = await wallet.sign({
            encryptionPass: p1,
            keyRef: newKey.controller[0]
        }, message)


        const crp = getCryptoProvider(cryptoUtils)
        const wrong_sig = Buffer.from("rX1+vdS4/OelZZZZq/+2PJc70P2ZD2wu/eJINet5es9QVkDf7P70whQ84qvyF7Qp/wxVGbW/HWpTqjDCxrJDiA==", 'base64')

        await expect(crp.verify(key, newKey.type, message, sig)).resolves.toEqual(true)
        await expect(crp.verify(key, newKey.type, message, wrong_sig)).resolves.toEqual(false)
    });

});
