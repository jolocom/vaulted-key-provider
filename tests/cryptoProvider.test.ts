import { getCryptoProvider, PublicKeyInfo, KeyTypes } from "../src";

// Testing against a specific implementation
import { cryptoUtils } from '@jolocom/native-utils-node'

describe("Crypto Provider", () => {
    test("Verify a signature", async () => {
        const crp = getCryptoProvider(cryptoUtils)
        
        const kt = KeyTypes.ecdsaSecp256k1VerificationKey2019
        const key = Buffer.from('A27--3mGAcf9wsYk1qvasW2pCydHUMLrzXKf2Y8ebAAU', 'base64')
        const message = Buffer.from("hello there")

        const sig = Buffer.from("08Hh14td0qeYt_vyEgEu7UclLmo-XT9VI1KJd5peEGhib7AHdDXzBEN8zzvunUGn3U1BTOrVGRUCKw-UGdxZZg", 'base64')
        const wrong_sig = Buffer.from("rX1+vdS4/OelZZZZq/+2PJc70P2ZD2wu/eJINet5es9QVkDf7P70whQ84qvyF7Qp/wxVGbW/HWpTqjDCxrJDiA==", 'base64')

        await expect(crp.verify(key, kt, message, sig)).resolves.toEqual(true)
        await expect(crp.verify(key, kt, message, wrong_sig)).resolves.toEqual(false)
    });

    test("Generate a random buffer", async () => {
      
    });

    test("Encrypt", async () => {
      
    });

});
