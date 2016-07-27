'use strict';

const chai = require('chai');
const expect = chai.expect;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
// const Scenario = require('../../../lib/objects/scenario');

const EventEmitter = require('events');

const JobManager = require('../../../lib');

class MockContext extends EventEmitter {
  constructor(context) {
    super();
    this.data = context.data;
  }
}

describe('JobManager.validate', () => {
  let jobManager;

  before(() => {
    jobManager = new JobManager({}, { name: 'mock' });
  });

  it('should have correct properties', (done) => {
    const scenarioData = {
      id: '1111111111',
      name: 'testScenario',
      description: 'Test scenario',
      scopetested: '',
      testsuites: [{ id: '1231231232', name: 'testTestSuite', applicationtested: '', parent: '' }],
      configuration: { id: '1232131232', name: 'testConfig', targetmode: '', runmode: 'mono' },
      pendingtimeout: 1000,
      runningtimeout: 1000,
      scheduled: true,
    };

    const contextData = new MockContext({
      data: {
        payload: scenarioData,
        nature: {
          type: 'testtype',
          quality: 'testquality',
        },
      },
    });

    expect(jobManager.validate(contextData))
      .to.be.fulfilled.and.notify(done);
  });
});