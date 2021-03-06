'use strict';

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const _ = require('lodash');

const BusinessLogicsUtils = require('../../../utils/businesslogics');
const inputJob = require('./run.sample.testdata.js');

describe('BusinessLogics - Execution - Run - sendSharedComandToInstances', () => {
  const scenario = inputJob.payload.scenario;
  const configuration = inputJob.payload.configuration;
  const execution = {
    id: '1234567890',
    pendingTimeout: 10000,
    commandsCount: 1,
    instances: [
      { hostname: 'machine1' },
      { hostname: 'machine2' },
    ],
  };

  let sandbox;
  let helper;
  let stubMessengerSendOneMessageToOneQueue;
  let stubMessengerSendManyMessagesToOneQueue;
  let stubMessengerSendOneMessageToManyQueues;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    helper = BusinessLogicsUtils.createHelper('run.js');
    stubMessengerSendOneMessageToOneQueue = sandbox.stub(helper.messenger,
      'sendOneMessageToOneQueue');
    stubMessengerSendManyMessagesToOneQueue = sandbox.stub(helper.messenger,
      'sendManyMessagesToOneQueue');
    stubMessengerSendOneMessageToManyQueues = sandbox.stub(helper.messenger,
      'sendOneMessageToManyQueues');
  });
  afterEach(() => {
    sandbox.restore();
  });

  context('when everything ok', () => {
    context('when it is GROUP mode', () => {
      it('should call sendOneMessageToOneQueue method', () => {
        const configurationGroup = _.cloneDeep(configuration);
        configurationGroup.runMode = 'group';
        stubMessengerSendOneMessageToOneQueue.resolves();
        stubMessengerSendOneMessageToManyQueues.resolves();

        const promise = helper.sendSharedCommandToInstances(scenario,
          configurationGroup, execution);
        return promise.then(() => {
          const runMessage = helper.getRunMessage(execution, scenario.testSuite);
          const sharedQueue = helper.getSharedQueueName(execution.id);
          const options = {
            autoDelete: true,
            expires: execution.pendingTimeout + 3000,
          };
          const readMessage = helper.getReadMessage(execution, sharedQueue);
          sinon.assert.calledWith(stubMessengerSendOneMessageToOneQueue,
            runMessage, sharedQueue, options);
          sinon.assert.calledWith(stubMessengerSendOneMessageToManyQueues,
            readMessage, ['cta.machine1', 'cta.machine2']);
        });
      });
    });

    context('when it is PARALLEL mode', () => {
      it('should call sendManyMessagesToOneQueue method', () => {
        const configurationParallel = _.cloneDeep(configuration);
        configurationParallel.runMode = 'parallel';
        stubMessengerSendManyMessagesToOneQueue.resolves();
        stubMessengerSendOneMessageToManyQueues.resolves();

        const promise = helper.sendSharedCommandToInstances(scenario,
          configurationParallel, execution);
        return promise.then(() => {
          const runMessageParallel = helper.getRunMessageForParallel(execution, scenario.testSuite);
          const sharedQueue = helper.getSharedQueueName(execution.id);
          const options = {
            autoDelete: true,
            expires: execution.pendingTimeout + 3000,
          };
          const readMessage = helper.getReadMessage(execution, sharedQueue);
          sinon.assert.calledWith(stubMessengerSendManyMessagesToOneQueue,
            runMessageParallel, sharedQueue, options);
          sinon.assert.calledWith(stubMessengerSendOneMessageToManyQueues,
            readMessage, ['cta.machine1', 'cta.machine2']);
        });
      });
    });
  });
});
