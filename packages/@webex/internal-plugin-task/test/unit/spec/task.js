/*!
 * Copyright (c) 2015-2020 Cisco Systems, Inc. See LICENSE file.
 */

import { assert, expect } from "@webex/test-helper-chai";
import Task from '@webex/internal-plugin-task';
import MockWebex from '@webex/test-helper-mock-webex';
import sinon from 'sinon';

import {
  RAINDROP_REGISTERED,
  RAINDROP_UNREGISTERED,
} from '../../../src/constants';

describe('internal-plugin-task', () => {

  describe('Task Apis', () => {
    let webex;

    beforeEach(async () => {
      webex = new MockWebex({
        children: {
          task: Task,
        },
      });

      webex.canAuthorize = true;
      webex.internal.device = {
        register: sinon.stub().returns(Promise.resolve()),
        unregister: sinon.stub().returns(Promise.resolve()),
      };
      webex.internal.mercury = {
        connect: sinon.stub().returns(Promise.resolve()),
        disconnect: sinon.stub().returns(Promise.resolve()),
        on: sinon.stub().callsFake((event, callback) => {
        }),
        off: sinon.spy(),
      };
      webex.internal.encryption = {
        kms: {
          createUnboundKeys: sinon.stub().resolves([{
            uri: "kms://kms-us-int.wbx2.com/keys/xxxx-xxxx-xxxx-xxxx"
          }])
        },
        encryptText: sinon.stub().resolves("encryptedText"),
        decryptText: sinon.stub().resolves("decryptedText"),
      };
    });

    describe('Public Api Contract', () => {

      describe('#register()', () => {
        it('on task register call mercury registration', async () => {
          await webex.internal.task.register();
          assert.calledOnce(webex.internal.device.register);
          assert.callCount(webex.internal.mercury.on, 0);
          assert.equal(webex.internal.task.registered, true);
        });
        it('should trigger `task:register` event', async () => {
          const spy = sinon.spy();

          webex.internal.task.on(RAINDROP_REGISTERED, spy);
          await webex.internal.task.register();
          assert.calledOnce(spy);
        });

        describe('Events', () => {
        });
      });

      describe('#unregister()', () => {
        it('should call `mercury.unregister` and `device.unregister`', async () => {
          await webex.internal.task.register();
          await webex.internal.task.unregister();
          assert.callCount(webex.internal.mercury.off, 0);
          assert.calledOnce(webex.internal.mercury.disconnect);
          assert.calledOnce(webex.internal.device.unregister);
        });
        it('should trigger `task:unregister` event', async () => {
          const spy = sinon.spy();

          // reset the state back
          await webex.internal.task.register();
          webex.internal.task.on(RAINDROP_UNREGISTERED, spy);
          await webex.internal.task.unregister();
          assert.calledOnce(spy);
        });
      });

      describe('#listMyTasks()', () => {
        it('should fetch my task list', async () => {
          webex.request = sinon.stub().returns(
            Promise.resolve({
              body: {
                items: [
                  {
                    "id": "abcdabcd-abcd-abcd-abcd-00000000",
                    "title": "Encrypted Task Title",
                    "note": "Encrypted Task Note",
                    "encryptionKeyUrl": "/keys/e5d3f747-6adf-432d-999c-6578e33953e3",
                  }
                ],
              },
            })
          );
          const res = await webex.internal.task.listMyTasks();

          assert.equal(res.body.items.length, 1);
          assert.calledWith(webex.request, {
            method: 'GET',
            service: 'raindrop',
            resource: 'tasks',
            qs: {},
          });
        });
      });

      describe("#getTask()", () => {
        it("should fetch task data", async () => {
          const id = "abcdabcd-abcd-abcd-abcd-00000000";
          const title = "Encrypted Task Title";
          webex.request = sinon.stub().resolves({
            body: {
              "id": id,
              "title": title,
              "note": "Encrypted Task Note",
              "encryptionKeyUrl": "/keys/e5d3f747-6adf-432d-999c-6578e33953e3",
            }
          });

          const res = await webex.internal.task.getTask(id);

          expect(res.body.id).to.equal(id);
          expect(res.body.title).to.equal("decryptedText");
          assert.calledWith(webex.request, {
            method: "GET",
            service: "raindrop",
            resource: `tasks/${id}`,
          });
        });
      });

      describe("#createTask()", () => {
        it("should create an task", async () => {
          const data = {
            encryptionKeyUrl: "kms://kms-us-int.wbx2.com/keys/d1c14fc5-be10-4389-ae83-9521f92fbfd3",
            title: "My Task 1",
          };

          webex.request = sinon.stub().resolves({
            body: {
              id: "abcdabcd-abcd-abcd-abcd-00000000",
              title: "My Task 1",
            }
          });

          const res = await webex.internal.task.createTask(data);

          expect(res.body.id).to.equal("abcdabcd-abcd-abcd-abcd-00000000");
          assert.calledWith(webex.request, {
            method: "POST",
            service: "raindrop",
            body: data,
            resource: "tasks",
          });
        });
      });

      describe("#updateTask()", () => {
        it("should update a task", async () => {
          const id = "abcdabcd-abcd-abcd-abcd-00000000";
          const data = {
            encryptionKeyUrl: "kms://kms-us-int.wbx2.com/keys/d1c14fc5-be10-4389-ae83-9521f92fbfd3",
            title: "My Task 1",
          };

          webex.request = sinon.stub().resolves({
            body: {
              id: "abcdabcd-abcd-abcd-abcd-00000000",
              title: "My Task 1",
            }
          });

          const res = await webex.internal.task.updateTask(id, data);

          expect(res.body.id).to.equal("abcdabcd-abcd-abcd-abcd-00000000");
          assert.calledWith(webex.request, {
            method: "PATCH",
            service: "raindrop",
            body: data,
            resource: `tasks/${id}`,
          });
        });
      });

      describe("#deleteTask()", () => {
        it("should delete a task event", async () => {
          const id = "abcdabcd-abcd-abcd-abcd-00000000";

          webex.request = sinon.stub().resolves({
            body: {}
          });

          await webex.internal.task.deleteTask(id);

          assert.calledWith(webex.request, {
            method: "DELETE",
            service: "raindrop",
            resource: `tasks/${id}`,
          });
        });
      });

    });
  });
});
