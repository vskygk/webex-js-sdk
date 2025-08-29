import sinon from 'sinon';
import {expect} from '@webex/test-helper-chai';
import EncryptHelper from '@webex/internal-plugin-task/src/encrypt.helper';
describe('internal-plugin-task', () => {
  describe('encryptHelper', () => {
    let ctx;
    beforeEach(() => {
      ctx = {
        webex: {
          internal: {
            encryption: {
              encryptText: sinon.stub(),
              kms: {
                createUnboundKeys: sinon.stub().resolves([{
                  uri: 'kmsKeyUri',
                }]),
              }
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
