import * as fs from 'fs';
import * as path from 'path';
import { ApplePaymentTokenDecryptor } from '.';

const pathToKeys = path.join(__dirname, 'test-data');

const validPrivatePem = fs.readFileSync(
  path.join(pathToKeys, 'privatePem.pem'),
  'utf8',
);

const validCertPem = fs.readFileSync(
  path.join(pathToKeys, 'certPem.pem'),
  'utf8',
);

const expectedPayload = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'test-data', 'payload.json'), {
    encoding: 'utf8',
  }),
);

describe('ApplePaymentTokenDecryptor', () => {
  it('decrypts a valid payload with a valid cert and private key', () => {
    const decryptor = new ApplePaymentTokenDecryptor(
      expectedPayload.paymentData,
    );
    const result = decryptor.decrypt(validCertPem, validPrivatePem);

    expect(result.applicationPrimaryAccountNumber).toEqual('6504840209544524');
    expect(result.applicationExpirationDate).toEqual('210131');
    expect(result.currencyCode).toEqual('840');
    expect(result.transactionAmount).toEqual(42420);
    expect(result.deviceManufacturerIdentifier).toEqual('000000000001');
    expect(result.paymentDataType).toEqual('3DSecure');
    expect(result.paymentData.onlinePaymentCryptogram).toEqual(
      'AAkBAgUXkQAACSAJFxeRhO1DX0E=',
    );
    expect(result.paymentData.eciIndicator).toEqual('5');
  });
});
