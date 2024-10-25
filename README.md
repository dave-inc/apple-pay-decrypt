# Apple Pay Decrypt

This is forked from https://github.com/samcorcos/apple-pay-decrypt and all credit should go to samcorcos. I've updated the dependencies to the latest versions, fixed any security vulns by running `npm audit fix` and added typescript typings. This is now compatible with node 14+.

This should only exist in GH packages now.

## Getting Started

```sh
npm i --save @dave-inc/apple-pay-decrypt
```

In order to decrypt the token, you will need two `.pem` files. One is a certificate and one is a key. The process for generating these is complicated.

If you get stuck, [this document](https://aaronmastsblog.com/blog/apple-pay-certificates/) might be helpful.

## How to Renew and Rotate Apple Pay Payment Certificate

The following steps were largely taken from the article written by [@amast09](https://github.com/amast09) to generate your keys. Repeat steps 2 - 20 for each environment (STAGING/PROD).

Note: we have no metrics in STAGING and are unable to test this in STAGING because Apple Pay doesn't work for our STAGING env. So just renew the certificate, update the secret version, and disable the previous secret version for STAGING.

1. Generate a CSR file with the following command. This will create two files `private.key` and `request.csr`. (Note: you can use the same `private.key` and `request.csr` for STAGING and PROD):

```sh
openssl ecparam -out private.key -name prime256v1 -genkey
openssl req -new -sha256 -key private.key -nodes -out request.csr
```

2. Go to the [Apple Developer Certificate Manager](https://developer.apple.com/account/resources/certificates/list). Make sure you have a Merchant Id. Navigate to `Identifiers` => `Merchant IDs` to make sure you have one, if not, create one.

3. Go to `Certificates` tab, then click `+` on the right side of the `Certificate`s header.

4. Scroll down and select `Apple Pay Payment Processing Certificate` and click `Continue`.

5. Select the merchant id (`A594HSLR6B.merchant.com.trydave.dave.staging` for STAGING and `A594HSLR6B.merchant.com.trydave.dave` for PROD) in the dropdown menu then click `Continue`.

6. Do not edit the name and scroll down to the Apple Pay Payment Processing Certificate section and Click `Create Certificate`.

7. Upload the `.csr` file you created (`request.csr`) from step 1 and click `Continue`. `.csr` is the same as `.certSigningRequest`. (Note: you can use the same `request.csr` for STAGING and PROD)

8. Click `Download` which will download as `apple_pay.cer`. You need that file to create the key. (Note: make sure to use the correct `apple_pay.cer` for each environment because there is no option to change the name when you download the cert from the developer website).

9. Generate a PEM file with the following command. You will may need to password protect your `.p12` file. If you're using a company laptop you can leave the password blank and press `Enter`, else create a password and keep it somewhere secure.

```sh
# STAGING - make sure to use the correct apple_pay.cer (merchant.com.trydave.dave.staging) because you won't be able to rename the file when you download the cert from the developer website
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out stagingTemp.pem
openssl pkcs12 -export -out stagingKey.p12 -inkey private.key -in stagingTemp.pem

# PROD - make sure to use the correct apple_pay.cer (merchant.com.trydave.dave) because you won't be able to rename the file when you download the cert from the developer website
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out prodTemp.pem
openssl pkcs12 -export -out prodKey.p12 -inkey private.key -in prodTemp.pem
```

10. You now have the two files you need to decrypt Apple Pay tokens, but before you can do that, you need to convert them into `.pem` files. Run the following commands to convert them to `.pem` files:

```sh
# STAGING
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out stagingCertPem.pem
openssl pkcs12 -in stagingKey.p12 -out stagingPrivatePem.pem -nocerts -nodes

# PROD
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out prodCertPem.pem
openssl pkcs12 -in prodKey.p12 -out prodPrivatePem.pem -nocerts -nodes
```

11. After all that, you should have a certificate (`<staging|prod>CertPem.pem`) file that looks something like this:

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

And a key (`<staging|prod>PrivatePem.pem`) that looks something like this:

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

12. Run the following commands and copy the output of the `<staging|prod>CertPem.pem` file and the `<staging|prod>PrivatePem.pem` file to be used in step 13. (do not copy the % at the end of the output string the string should end in \n)

```sh
# replace <staging|prod> with either staging or prod
awk '{printf "%s\\n", $0}' <staging|prod>CertPem.pem
```

```sh
# replace <staging|prod> with either staging or prod
awk '{printf "%s\\n", $0}' <staging|prod>PrivatePem.pem
```

13. Create a json file `<staging|prod>Cert.json` and use the values from step 12 to replace the values of the certPem/privatePem keys of the example json object below. Replace the version value to the expiration date of the new certificate found in the `EXPIRATION` column of the [certificate list](https://developer.apple.com/account/resources/certificates/list). The expiration should be 2 yrs from the day the certificate was created.

```json
{
  "certPem": "-----BEGIN CERTIFICATE-----\nMIIEcjCCBBegAwIBAgIINWgcF0wqlb0wCgYIKoZIzj0EAwIwgYAxNDAyBgNVBAGG\nK2FwcGxlIFdvcmxkd2lkZSBEZXZlbG9wZXIgUmVsYXRpb25zIENBIC0gRzIxJjAk\nBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApB\ncHBsZSBJbmMuMQswCQYDVQQGEwJVUzAeFw0yNDEwMjMyMDU2NTBaFw0yNjExMjIy\nMDU2NDlaMIGiMSkwJwYKCZImiZPyLGQBAQwZbWVyY2hhbnQuY29tLnRyeWRhdmUu\nZGF2ZTE/MD0GA1UEAww2QXBwbGUgUGF5IFBheW1lbnQgUHJvY2Vzc2luZzptZXJj\naGFudC5jb20udHJ5ZGF2ZS5kYXZlMRMwEQYDVQQLDApBNTk0SFNMUjZCMRIwEAYD\nVQQKDAlEYXZlLCBJbmMxCzAJBgNVBAYTAlVTMFkwEwYHKoZIzj0CAQYIKoZIzj0D\nAQcDQgAEVKyEHUx/8XBrr3I0HlTt7/K4HsKTOTf0LgDh8pN2ZU9eS/1mrNwkPJc8\nRIqzQpQiba9qn+C++3zthjIlL/7jXKOCAlUwggJRMAwGA1UdEwEB/wQCMAAwHwYD\nVR0jBBgwFoAUhLaEzDqGYnIWWZToGqO9SN863wswRwYIKwYBBQUHAQEEOzA5MDcG\nCCsGAQUFBzABhitodHRwOi8vb2NzcC5hcHBsZS5jb20vb2NzcDA0LWFwcGxld3dk\ncmNhMjAxMIIBHQYDVR0gBIIBFDCCARAwggEMBgkqhkiG92NkBQEwgf4wgcMGCCsG\nAQUFBwICMIG2DIGzUmVsaWFuY2Ugb24gdGhpcyBjZXJ0aWZpY2F0ZSBieSBhbnkg\ncGFydHkgYXNzdW1lcyBhY2NlcHRhbmNlIG9mIHRoZSB0aGVuIGFwcGxpY2FibGUg\nc3RhbmRhcmQgdGVybXMgYW5kIGNvbmRpdGlvbnMgb2YgdXNlLCBjZXJ0aWZpY2F0\nZSBwb2xpY3kgYW5kIGNlcnRpZmljYXRpb24gcHJhY3RpY2Ugc3RhdGVtZW50cy4w\nNgYIKwYBBQUHAgEWKmh0dHA6Ly93d3cuYXBwbGUuY29tL2NlcnRpZmljYXRlYXV0\naG9yaXR5LzA2BgNVHR8ELzAtMCugKaAnhiVodHRwOi8vY3JsLmFwcGxlLmNvbS9h\ncHBsZXd3ZHJjYTIuY3JsMB0GA1UdDgQWBBSrIS1b4HWd5BEbGS14bDRd2pqECzAO\nBgNVHQ8BAf8EBAMCAygwTwYJKoZIhvdjZAYgBEIMQDhEMTk2OEY3OUIwNzNDOTg4\nNkZDNTczQ0YxMEI2NUREMEE0Mjg2OTk2N0IwMDQ1MDE1QTFDRjg2MEI0MTA0M0Uw\nCgYIKoZIzj0EAwIDSQAwRgIhANHZkwHzLInFEb9R7ufoGbp7LauAIl7debYCAYVr\nAtkfAiEAtLyGSrJDlSf/q7TOlztD6RvaQlYur30/k/oJinrVr9M=\n-----END CERTIFICATE-----\n",
  "privatePem": "Bag Attributes\n    localKeyID: 8D 25 96 C8 23 FE B8 5E 72 04 75 12 C0 5E A2 83 F7 30 34 93 \nKey Attributes: <No Attributes>\n-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCQqGSM49AwEHBG0wawIBAQQgb9Oz8+IrYa0LfFGP\nfMq1UaktcZzhmQyHAyLx6mO08RuhRANCAARUrIQdTQ/xcGuvcjQeVO3v8rgewpM5\nN/QuAOHyk5ZlT15L/Was3CQ8lzxEirNClCJtr2qf4L77fO2GMiUv/uNc\n-----END PRIVATE KEY-----\n",
  "version": "2026-11-22"
}
```

14. Navigate to [GSM](https://console.cloud.google.com/security/secret-manager?project=banking-ecf4), select the correct project id (`internal-1-4825` for STAGING, `banking-ecf4` and `dave-173321` for PROD), search for `_cfgload-apple-pay-cert`, and click the name. Direct link: [\_cfgload-apple-pay-cert in STAGING](https://console.cloud.google.com/security/secret-manager/secret/_cfgload-apple-pay-cert/versions?project=internal-1-4825) and [\_cfgload-apple-pay-cert in PROD](https://console.cloud.google.com/security/secret-manager/secret/_cfgload-apple-pay-cert/versions?project=banking-ecf4), and [\_cfgload-apple-pay-cert in PROD (legacy)](https://console.cloud.google.com/security/secret-manager/secret/_cfgload-apple-pay-cert/versions?project=dave-173321).

15. Click the `+ NEW VERSION` button. Upload the json file created in step 13. **DON'T** select the `Disable all past versions` (we want to keep the previous and new versions enabled for now so the keys rotate while the new certificate propogates after we activate it). Click `ADD NEW VERSION` button.

16. Observe the [metrics](https://app.datadoghq.com/dashboard/89w-4sr-zdh/apple-pay-payment-processing) to see the new version fails and the previous version succeeds. This is normal and shows that we are successfully rotating the secret if one of them fails. If there are no metrics for the new version, we may need to redeploy banking-api to fetch the latest secret. If there are no metrics at all, manually create card funding with Apple Pay to trigger the metrics.

17. Go to [Certificates](https://developer.apple.com/account/resources/certificates/list), click the newly created certificate, click the `Activate` button and click the `Activate` button in the modal. Proceed with caution and make sure we correctly followed the steps to prevent Apply Pay transactions from failing.

18. Wait ~45mins or so and observe the [metrics](https://app.datadoghq.com/dashboard/89w-4sr-zdh/apple-pay-payment-processing) to show the new version succeed. We may need to manual create card funding with Apple Pay if there are no metrics. If there are no metrics after manual intervention, go over the previous steps to make sure we didn't skip a step or made a mistake.

19. Wait ~3 hrs after the first success with the new version as we may observe the old version succeed and the new version failing randomly.

20. Disable the previous secret version in GSM once we have at least a 3 hrs timespan of only the new version succeeding and no [metrics](https://app.datadoghq.com/dashboard/89w-4sr-zdh/apple-pay-payment-processing) of the old version succeeding.

## IMPORTANT NOTES:

- It takes about an hour for the new certificate to propagate after activation. Failures will occur for about an hour when trying to decrypt with the new certificate values. You'll need to fallback to old values for safe rotation. https://tech.bolt.com/apple-pay-certificate-rotation-e4eee6b0683f
- DataDog dashboard https://app.datadoghq.com/dashboard/89w-4sr-zdh/apple-pay-payment-processing

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

- Remember that the `transactionAmount` will come back as the number of cents so \$500 = 50000
- You can then use those decrypted values with your payment processor of choice (Stripe, Braintree, in our case Tabapay) to process payments from Apple Pay.
