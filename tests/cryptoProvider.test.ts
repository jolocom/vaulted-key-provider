import { getCryptoProvider, PublicKeyInfo, KeyTypes } from "../src";

// Testing against a specific implementation
import { cryptoUtils } from '@jolocom/native-utils-node'

describe("Crypto Provider", () => {
    test("Verify a signature", async () => {
        const crp = getCryptoProvider(cryptoUtils)
        
        const sig = Buffer.from("ioZICIhQZyqa5Qpvsj6VZnlwDZR5qfCSH1ZjttAetOwv7aLiuTWSVgt8EokcPWkcsxSaa0toJ7F5JpxR8R7yNQ", 'base64')
        const wrong_sig = Buffer.from("ioZICIhQZyZZZZpvsj6VZnlwDZR5qfCSH1ZjttAetOwv7aLiuTWSVgt8EokcPWkcsxSaa0toJ7F5JpxR8R7yNQ", 'base64')
        const key: PublicKeyInfo = {
            id: 'urn:uuid:be3ac5ca-967a-4853-baad-0705ec59540d',
            controller: [ 'my_wallet_id#key-1' ],
            type: KeyTypes.ecdsaSecp256k1VerificationKey2019,
            publicKeyHex: '036bff322bf8e1c05821a79b1dc266255fd61b5eb1e8c9a9a690347a26e32015e6'
        }

        const message = Buffer.from("hello there")

        expect(crp.verify(key, message, sig)).resolves.toEqual(true)
        expect(crp.verify(key, message, wrong_sig)).resolves.toEqual(false)
    });

    test("Generate a random buffer", async () => {
      
    });

    test("Encrypt", async () => {
      
    });

});
