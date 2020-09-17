export declare type TokenAttributes = {
    version: string;
    data: string;
    signature: string;
    header: {
        ephemeralPublicKey: string;
        publicKeyHash: string;
        transactionId: string;
    };
};
export declare type DecryptedApplePaymentToken = {
    applicationPrimaryAccountNumber: string;
    applicationExpirationDate: string;
    currencyCode: string;
    transactionAmount: number;
    deviceManufacturerIdentifier: string;
    paymentDataType: string;
    paymentData: {
        onlinePaymentCryptogram: string;
        eciIndicator: string;
    };
};
/**
 * Initializing an instance of `PaymentToken` with JSON values present in the Apple Pay token string
 * JSON representation - https://developer.apple.com/library/ios/documentation/PassKit/Reference/PaymentTokenJSON/PaymentTokenJSON.html
 */
export declare class ApplePaymentTokenDecryptor {
    private ephemeralPublicKey;
    private cipherText;
    constructor(tokenAttrs: TokenAttributes);
    /**
     * Decrypting the token using the PEM formatted merchant certificate and private key (the latter of which, at least, is managed by a third-party)
     */
    decrypt(certPem: string, privatePem: string): DecryptedApplePaymentToken;
    /**
     * Generating the shared secret with the merchant private key and the ephemeral public key(part of the payment token data)
     * using Elliptic Curve Diffie-Hellman (id-ecDH 1.3.132.1.12).
     * As the Apple Pay certificate is issued using prime256v1 encryption, create elliptic curve key instances using the package - https://www.npmjs.com/package/ec-key
     */
    private sharedSecret;
    /**
     * Extracting merchant id from merchant certificate
     * Merchant ID is the data of the extension 1.2.840.113635.100.6.32, which is the merchant identifier field (OID 1.2.840.113635.100.6.32).
     * This an id extension of the certificate it’s not your merchant identifier.
     * Parsing the certificate with the x509 NPM package - https://www.npmjs.com/package/x509#x509parsecert-cert-
     */
    private merchantId;
    /**
     * Derive the symmetric key using the key derivation function described in NIST SP 800-56A, section 5.8.1
     * https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-56ar.pdf
     * The symmetric key is a sha256 hash that contains shared secret token plus encoding information
     */
    private symmetricKey;
    /**
     * Decrypting the cipher text from the token (data in the original payment token) key using AES–256 (id-aes256-GCM 2.16.840.1.101.3.4.1.46), with an initialization vector of 16 null bytes and no associated authentication data.
     *
     */
    private decryptCiphertext;
}
