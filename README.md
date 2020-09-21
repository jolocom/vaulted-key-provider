# Vaulted Key Provider

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [Vaulted Key Provider](#vaulted-key-provider)
    - [Usage](#usage)
        - [Wallet and Key Creation](#wallet-and-key-creation)
        - [Signing and Verification](#signing-and-verification)
        - [Encryption and Decryption](#encryption-and-decryption)
    - [Structure](#structure)

<!-- markdown-toc end -->

Vaulted Key Provider implements a simple, secure key store based on an encrypted [UniversalWallet2020](https://w3c-ccg.github.io/universal-wallet-interop-spec/) instance and a set of utility functions implementing operations on the wallet, along with a simple crypto utility interface for anoncryption and signature verification. An implementation of the `EncryptedWalletUtils` and `CryptoUtils` is currently available with the [`@jolocom/native-core`](https://github.com/jolocom/rust-multi-target) module. It builds upon a [Rust implementation of the UniversalWallet2020 spec](https://github.com/jolocom/wallet-rs).

## Usage
### Wallet and Key Creation
``` typescript
import { walletUtils } from '@jolocom/native-core'
import { SoftwareKeyProvider } from '@jolocom/vaulted-key-provider'

// create an empty wallet
const id = "my_id"
const wallet = await SoftwareKeyProvider.newEmptyWallet(
    walletUtils,
    id,
    password
)

// or create from an existing encrypted wallet
const wallet = new SoftwareKeyProvider(walletUtils, encryptedWalletBuffer, id)

// add a new randomly generated secp256k1 signing key pair to the wallet
const newSigningKey = await wallet.newKeyPair(
    password,
    KeyTypes.ecdsaSecp256k1VerificationKey2019,
    `signing-key-1`
)
/*
{
   id: "urn:some-urn-identifier",
   publicKeyHex: "hex-encoded public key",
   type: "EcdsaSecp256k1VerificationKey2019",
   controller: ["signing-key-1"]
 }
 **/
 
// add a new randomly generated x25519 key agreement key pair to the wallet
const newEncryptionKey = await wallet.newKeyPair(
    password,
    KeyTypes.x25519KeyAgreementKey2019,
    `encryption-key-1`
)
/*
{
   id: "urn:some-urn-identifier",
   publicKeyHex: "hex-encoded public key",
   type: "X25519KeyAgreementKey2019",
   controller: ["encryption-key-1"]
 }
 **/
```

### Signing and Verification
``` typescript
import { cryptoUtils } from '@jolocom/native-core'
import { getCryptoProvider } from '@jolocom/vaulted-key-provider'

const crypto = getCryptoProvider(cryptoUtils)

const data = Buffer.from("some arbitrary data")

// create a signature using newSigningKey generated previously
const signature = await wallet.sign({
    encryptionPass: password,
    keyRef: "signing-key-1"
}, data)

const isValid = await crypto.verify(
    Buffer.from(newSigningKey.publicKeyHex, 'hex'),
    newSigningKey.type,
    data,
    signature
)
// true
```

### Encryption and Decryption
``` typescript
const plaintext = Buffer.from("some arbitrary data")

// encrypt to newEncryptionKey generated previously
const ciphertext = await crypto.encrypt(
    Buffer.from(newEncryptionKey.publicKeyHex, 'hex'),
    KeyTypes.x25519KeyAgreementKey2019,
    plaintext
)

// decrypt using newEncryptionKey generated previously
const decrypted = await wallet.decrypt({
    encryptionPass: password,
    keyRef: "encryption-key-1"
}, ciphertext)

// decrypted.toString() === "some arbitrary data"
```

## Structure
This package defines two purely functional APIs for performing crypto operations:
- `CryptoUtils`: Public Key crypto operations (anoncryption + verification)
- `EncryptedWalletUtils`: Private Key crypto operations (decryption + signing)

Additionally it exposes two higher level idiomatic Typescript interfaces:
- `ICryptoProvider`: A general purpose Public Key crypto provider. Intended to be used as a high-level, simple API for anoncryption, signature verification and random number generation. Implementations should be fully stateless.
- `IVaultedKeyProvider`: (implemented by SoftwareKeyProvider): A secure encrypted Key store and Private Key crypto provider. This interface is intended to be implemented by a class with two internal state objects, an ID and an encrypted state buffer.

Finally, these interfaces are implemented by two components which consume implementations of the lower-level APIs:
- `getCryptoProvider`: Take a `CryptoUtils` implementation and returns an `ICryptoProvider` implementation.
- `SoftwareKeyProvider`: A class which takes an `EncryptedWalletUtils` implementation and (combined with internal state) implements a simple, easy to use, secure key store implementing `IVaultedKeyProvider`.
