/*!
 * Copyright (c) 2015-2020 Cisco Systems, Inc. See LICENSE file.
 */

import '@webex/internal-plugin-task';

import {assert} from '@webex/test-helper-chai';
import WebexCore from '@webex/webex-core';
import '@webex/internal-plugin-conversation';
import testUsers from '@webex/test-helper-test-users';

describe.skip('plugin-task', function () {
  this.timeout(60000);
  describe('Task', () => {
    let createdTask, spock;

    beforeEach('create users', () =>
      testUsers.create({count: 1}).then((users) => {
        [spock] = users;
        spock.webex = new WebexCore({
          credentials: {
            authorization: spock.token,
          },
        });
      })
    );

    beforeEach('populate data', () =>
      spock.webex.internal.task
        .createTask({
          title: 'Task Title',
          note: 'Task Note',
        })
        .then((t) => {
          createdTask = t.body;
        })
    );

    afterEach(() =>
      spock.webex.internal.task
        .listMyTasks()
        .then((res) =>
          Promise.all(
            res.body.items.map((task) =>
              spock.webex.internal.task.deleteTask(task.id).catch((reason) => console.warn(reason))
            )
          )
        )
    );

    describe('#getTask()', () => {
      it('fetch the task', () =>
        spock.webex.internal.task.getTask(createdTask.id).then((task) => {
          assert.isObject(task);
          assert.equal(task.id, createdTask.id);
        }));
    });
  });
});
