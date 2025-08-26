import sinon from 'sinon';
import {expect} from '@webex/test-helper-chai';
import EncryptHelper from '@webex/internal-plugin-task/src/encrypt.helper';
describe('internal-plugin-task', () => {
  describe('encryptHelper', () => {
    let ctx;
    beforeEach(() => {
      ctx = {
        encryptionKeyUrl: 'http://example.com/encryption-key',
        webex: {
          internal: {
            encryption: {
              encryptText: sinon.stub(),
            },
          },
        },
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('#encryptTaskRequest with plain text fields', async () => {
      const taskRequest = {
        "title": "plain text title",
        "note": "plain text note",
        "encryptionKeyUrl": "/keys/e5d3f747-6adf-432d-999c-6578e33953e3",
      };
      const expectedCiphertext = 'some encrpty data';
      ctx.webex.internal.encryption.encryptText.callsFake((key, ciphertext) =>
        Promise.resolve(expectedCiphertext)
      );
      await EncryptHelper.encryptTaskRequest(ctx, taskRequest);
      expect(taskRequest.title).to.be.equal(expectedCiphertext);
      expect(taskRequest.note).to.be.equal(expectedCiphertext);
    });
  });
});
