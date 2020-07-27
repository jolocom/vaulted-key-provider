import { getCryptoProvider, PublicKeyInfo, KeyTypes } from "../src";

// Testing against a specific implementation
import { cryptoUtils } from '@jolocom/native-utils-node'

describe("Crypto Provider", () => {
    test("Verify a signature", async () => {
        const crp = getCryptoProvider(cryptoUtils)
        
        const sig = Buffer.from("rX1+vdS4/OelHDp+q/+2PJc70P2ZD2wu/eJINet5es9QVkDf7P70whQ84qvyF7Qp/wxVGbW/HWpTqjDCxrJDiA==", 'base64')
        const wrong_sig = Buffer.from("rX1+vdS4/OelZZZZq/+2PJc70P2ZD2wu/eJINet5es9QVkDf7P70whQ84qvyF7Qp/wxVGbW/HWpTqjDCxrJDiA==", 'base64')
        const key: PublicKeyInfo = {
            id: 'urn:uuid:be3ac5ca-967a-4853-baad-0705ec59540d',
            controller: [ 'my_wallet_id#key-1' ],
            type: KeyTypes.ecdsaSecp256k1VerificationKey2019,
            publicKeyHex: '02f05e682e4aeb871db365eb94717cc1a6826f7adc1552a9a4ccdc763ce54618fc'
        }

        const message = Buffer.from("hello there")

        await expect(crp.verify(key, message, sig)).resolves.toEqual(true)
        await expect(crp.verify(key, message, wrong_sig)).resolves.toEqual(false)
    });

    test("Generate a random buffer", async () => {
      
    });

    test("Encrypt", async () => {
      
    });

});
