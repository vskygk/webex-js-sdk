import sinon from "sinon";
import { expect } from "@webex/test-helper-chai";
import DecryptHelper from "@webex/internal-plugin-task/src/decrypt.helper";

describe("internal-plugin-task", () => {
  describe("DecryptHelper", () => {
    let ctx;
    let encryptedTaskData;
    let encryptedTasksData;

    beforeEach(() => {
      ctx = {
        webex: {
          internal: {
            encryption: {
              decryptText: sinon.stub()
            }
          }
        }
      };

      encryptedTaskData = {
        "id": "abcdabcd-abcd-abcd-abcd-00000000",
        "title": "Encrypted Task Title",
        "note": "Encrypted Task Note",
        "encryptionKeyUrl": "/keys/e5d3f747-6adf-432d-999c-6578e33953e3",
      };

      encryptedTasksData = {
        "offset": 0,
        "limit": 100,
        "hasMore": false,
        "items": [
          encryptedTaskData
        ]
      };

    });

    afterEach(() => {
      sinon.restore();
    });

    it("#decryptTaskResponse - should resolve with undefined if data is undefined", async () => {
      const decryptedData = await DecryptHelper.decryptTaskResponse(ctx, undefined);
      expect(decryptedData).to.be.undefined;
    });

    it("#decryptTaskResponse - should resolve with undefined if data.encryptionKeyUrl is undefined", async () => {
      encryptedTaskData.encryptionKeyUrl = undefined;
      const decryptedData = await DecryptHelper.decryptTaskResponse(ctx, encryptedTaskData);
      expect(decryptedData).to.be.undefined;
    });

    describe("#decryptTaskResponse - should replace encrypted data with decrypted data in response", () => {
      it("should decrypt scheduler data response correctly", async () => {
        // Stub the decryption method to return the plaintext value.
        const expectedCiphertext = "some decrypted text for testing";

        ctx.webex.internal.encryption.decryptText.callsFake((key, ciphertext) => Promise.resolve(expectedCiphertext));

        // Decrypt the data.
        await DecryptHelper.decryptTaskResponse(ctx, encryptedTaskData);

        // Check that all encrypted properties were decrypted correctly.
        expect(encryptedTaskData.title).to.equal(expectedCiphertext);
        expect(encryptedTaskData.note).to.equal(expectedCiphertext);
      });
    });

    it("#decryptTasksResponse - should resolve with undefined if data is undefined", async () => {
      const decryptedData = await DecryptHelper.decryptTasksResponse(ctx, undefined);
      expect(decryptedData).to.be.undefined;
    });

    it("#decryptTasksResponse - should resolve with undefined if data.items is undefined", async () => {
      const decryptedData = await DecryptHelper.decryptTasksResponse(ctx, {});
      expect(decryptedData).to.be.undefined;
    });

    it("#decryptTasksResponse - should resolve with undefined if data.items is empty", async () => {
      const decryptedData = await DecryptHelper.decryptTasksResponse(ctx, { items: [] });
      expect(decryptedData).to.be.undefined;
    });

    describe("#decryptTasksResponse - should replace encrypted data with decrypted data in response", () => {
      it("should decrypt tasks data response correctly", async () => {
        // Stub the decryption method to return the plaintext value.
        const expectedCiphertext = "some decrypted text for testing";

        ctx.webex.internal.encryption.decryptText.callsFake((key, ciphertext) => Promise.resolve(expectedCiphertext));

        // Decrypt the data.
        await DecryptHelper.decryptTasksResponse(ctx, encryptedTasksData);

        // Check that all encrypted properties were decrypted correctly.
        expect(encryptedTasksData.items[0].title).to.equal(expectedCiphertext);
        expect(encryptedTasksData.items[0].note).to.equal(expectedCiphertext);
      });
    });
  });
});
