# Apple Pay Decrypt

This is forked from https://github.com/samcorcos/apple-pay-decrypt and all credit should go to samcorcos. I've updated the dependencies to the latest versions, fixed any security vulns by running `npm audit fix` and added typescript typings. This is now compatible with node 14+.

This should only exist in GH packages now.

## Getting Started

```sh
npm i --save @dave-inc/apple-pay-decrypt
```

In order to decrypt the token, you will need two `.pem` files. One is a certificate and one is a key. The process for generating these is complicated.

If you get stuck, [this document](https://aaronmastsblog.com/blog/apple-pay-certificates/) might be helpful.

## How to Renew Apple Pay Payment Certificate

The following steps were largely taken from the article written by [@amast09](https://github.com/amast09)) to generate your keys.

1. Generate a CSR file with the following command:
```sh
openssl ecparam -out private.key -name prime256v1 -genkey
openssl req -new -sha256 -key private.key -nodes -out request.csr
```
2. Go to the [Apple Developer Certificate Manager](https://developer.apple.com/account/ios/certificate/). Make sure you have a Merchant Id. Navigate to `Identifiers` => `Merchant IDs` to make sure you have one, if not, create one.
3. Go to `Certificates` tab, then click `+` on the right side of the `Certificate`s header.
4. Scroll down and select `Apple Pay Payment Processing Certificate` and click `Continue`.
5. Select the merchant id (A594HSLR6B.merchant.com.trydave.dave for PROD and A594HSLR6B.merchant.com.trydave.dave.staging for STAGING) in the dropdown menu then click `Continue`.
6. Do not edit the name and scroll down to the Apple Pay Payment Processing Certificate section and Click `Create Certificate`.
7. Upload the `.csr` file you created (`request.csr`) in step 1 and click `Continue`. Note that `.csr` is the same as `.certSigningRequest`.
8. Click `Download` which will download as `apple_pay.cer`. You need that file to create the key.
9. Generate a PEM file with the following command. You will need to password protect your `.p12` file. If you're using a company laptop you can leave the password blank and press `Enter`, else create a password and keep it somewhere secure.
```sh
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out temp.pem
openssl pkcs12 -export -out key.p12 -inkey private.key -in temp.pem
```
10. You now have the two files you need to decrypt Apple Pay tokens, but before you can do that, you need to convert them into `.pem` files. Run the following commands to convert them to `.pem` files:
```sh
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out certPem.pem
openssl pkcs12 -in key.p12 -out privatePem.pem -nocerts -nodes
```
11. After all that, you should have a certificate (`certPem.pem`) file that looks something like this:

```
-----BEGIN CERTIFICATE-----
MIIEfzCCBCagAwIBAgIIcDQ4Fbx2jWYwCgYIKoZIzj0EAwIwgYAxNDAyBgNVBAMM
K0FwcGxlIFdvcmxkd2lkZSBEZXZlbG9wZXIgUmVsYXRpb25zIENBIC0gRzIxJjAk
BgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApB
cHBsZSBJbmMuMQswCQYDVQQGEwJVUzAeFw0xOTAyMjMxNDU2NDFaFw0yMTAzMjQx
NDU2NDFaMIGxMTAwLgYKCZImiZPyLGQBAQwgbWVyY2hhbnQuY29tLmdyYXRpdHVk
ZS5ncmF0aXR1ZGUxRjBEBgNVBAMMPUFwcGxlIFBheSBQYXltZW50IFByb2Nlc3Np
iWlORp7+MRSeIt3sEdnWIhY29xvHSdXgMT6kpaUupattcKtlHnLiYlTJHRRCO20x
2thoxaQriM+gFSnAyzrdaOnVTJHRRCO20xxcarcjHFr9GHRVsoysRC/ThwAqMaTs
XEV5VwHqpLuvzOca/+A5Q1MEkhH4lgNrqs5AhKkI1WZv2AWErjxkXBehvZy5C51n
RNcJ4KOAHTePfdrkQ3YVcyMnTlz2QBT8K/uLkoG/H1U8nNfaxwA5m6FDLoVXatC2
oGI+ctCv5Ge2SsEPaUqJ7zE3BU4UsbRvwiXwbWW42YZ2V2wvASdTiXw3/nv7apD4
H+PXFQuC86CSKNKV58jFZZNQoTlU0K+0rBR63ps4bBonVg4Bp2EBntFu5Du/rXMo
U5qxOgbh3/ZNtUT52AQicdJ0c+IgVYP6sGhVGorxMS0lFQ67qaj6luRaqzVovcGl
wa7DzQxcl0HZh2M/Wj9v2d+oGjlINlD9SAlWA/dWXrQF6kzEMoOJKBakO1SRVwD2
9UMDoM5JUK+iBteSFp6iHB7wyfb8VMwzzU3aSWDC+zrsbGXgQsFJ9ZClMyu/aiWs
rbugF9EtKocCWbODlxbRBp310XkPVcOKamZ0UI8P3+AvuMeXdnrFzUUBZnXU8bWM
RuIiK0QZobngHsRO3J/oT1h9URFflg7MrvbAyHTBPv5bSztOPcxOEIfwd+opq6Bc
MXZ+0fErpK5YW7jcahrPRp63e3FZjiKrHWZPFXXOH3N30VKRMDsKbZepNWu4glVb
YwKcj8BAm4LvxkCLODZVIsqYZbNTzyTWbKiz7G53Rt6XqFaQVlqlSxvA97SUfq62
RNcJ4KOAHTePfdrkQ3YVcyMnTlz2QBT8K/uLkoG/H1U8nNfaxwA5m6FDLoVXatC2
8nG5lEs5hYJ2WG9Yo39m1gyCHeNse5sOrph9Dq7tro5mO+nX3XaVaIi3MHFl9Hq6
uMetisso8rg633J/YpJipiz6MOdpf7Q7LqX6M0i3x4BJZfIa3xZPsUoEYObyGTJI
OtAJHpvnTIoDhBApBiH/sDq97pzcsl4VkngxxEiTEjXYQEIhcVQpG6lU6rX9+ekQ
qDRXQRMETBev1j7Y1w/v2K0CIAlnnXPVX52g5FTadoFyVq2a91sA4ao44VabMaz8
W5k1
-----END CERTIFICATE-----
```

And a key (`privatePem.pem`) that looks something like this:

```
Bag Attributes
    localKeyID: 90 C8 20 E7 8A 2A E5 7E 33 06 FD C5 43 47 9F 15 2F DE 73 90
Key Attributes: <No Attributes>
-----BEGIN PRIVATE KEY-----
8nG5lEs5hYJ2WG9Yo39m1gyCHeNse5sOrph9Dq7tro5mO+nX3XaVaIi3MHFl9Hq6
YwKcj8BAm4LvxkCLODZVIsqYZbNTzyTWbKiz7G53Rt6XqFaQVlqlSxvA97SUfq62
qDRXQRMETBev1j7Y1w/v2K0CIAlnnXPVX52g5FTadoFyVq2a91sA4ao4
-----END PRIVATE KEY-----
```

(these are not my real keys)

## Usage

The `tokenFromApplePay` you get from Apple Pay will look something like this:

```js
{
    "version": "EC_v1",
    "data": "vxae4VFHqdtWakaJ1wqQHyel...<a lot more data>...ggVQsfUxBXR8=",
    "signature": "MIAGCSqGSIb3DQEHAqCA...<a lot more data>...MAAAAAAAA=",
    "header": {
        "ephemeralPublicKey": "MFkwEwYHKoZIzj0CAQYIKoZICZImiZPyLGQBAQwgbWVyY2hhbnQuY29tLmdy332d55suNAl1RIZi3KIT5hwmiSKSch9+6OOGlRZw0xOTAy4jejmO0A==",
        "publicKeyHash": "0aB0KxDCKoZICZImiZPyLGQBAQwoIwz3m6bKxuqPe+F6yQco=",
        "transactionId": "54829332dd6db37d06KoZICZImiZPyLGQBAQw5e6f35059acad43133d792fc139"
    }
}
```

To decrypt the token, import the `.pem` files and create a new `ApplePaymentTokenDecryptor` with the token from Apple Pay. Then decrypt using the keys. Ensure you import the certificates as utf8 text and not Buffers.

```ts
import { ApplePaymentTokenDecryptor, TokenAttributes } from '@dave-inc/apple-pay-decrypt';

const certPem = fs.readFileSync(path.join(__dirname, '../path/to/certPem.pem'), 'utf8')
const privatePem = fs.readFileSync(path.join(__dirname, '../path/to/privatePem.pem'), 'utf8')

const tokenFromApplePay: TokenAttributes = {...} // from Apple Pay, might have to be adjusted slightly

const token = new ApplePaymentTokenDecryptor(tokenFromApplePay)

const decrypted = token.decrypt(certPem, privatePem)
```

The `decrypted` value at this point should look something like this:

```js
{
  applicationPrimaryAccountNumber: '17029283048730',
  applicationExpirationDate: '231231',
  currencyCode: '840',
  transactionAmount: 500,
  deviceManufacturerIdentifier: '544555544456',
  paymentDataType: '3DSecure',
  paymentData: {
    onlinePaymentCryptogram: 'IE0QTuXZlbG9wZXIgUmiQAQojEBhgA='
  }
}
```

# IMPORTANT NOTES: 

* Remember that the `transactionAmount` will come back as the number of cents so \$500 = 50000
* You can then use those decrypted values with your payment processor of choice (Stripe, Braintree, in our case Tabapay) to process payments from Apple Pay.
* It takes about an hour for the new certificate to propagate after activation.  Failures will occur for about an hour when trying to decrypt with the new certificate values.  You'll need to fallback to old values for safe rotation. https://tech.bolt.com/apple-pay-certificate-rotation-e4eee6b0683f
* DataDog dashboard https://app.datadoghq.com/dashboard/89w-4sr-zdh/apple-pay-payment-processing
