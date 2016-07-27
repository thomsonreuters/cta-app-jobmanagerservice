'use strict';

const chai = require('chai');
const expect = chai.expect;

const Execution = require('../../../lib/objects/execution');

describe('Execution', () => {
  const executionData = {
    id: '12345566789',
    scenario: '1111111111',
    configuration: { id: '', name: '', targetmode: '', runmode: '' },
    user: '22222222',
  };
  const executionFullData = {
    id: '12345566789',
    scenario: '1111111111',
    configuration: { id: '', name: '', targetmode: '', runmode: '' },
    user: '22222222',
    starttimestamp: 1213,
    updatetimestamp: 1214,
    state: 'pending',
    status: 'succeeded',
    ok: 1,
    partial: 1,
    inconclusive: 1,
    failed: 1,
    nbstatuses: 4,
    done: true,
    instances: [],
  };
  describe('validation', () => {
    it('should create correctly', () => {
      const execution = new Execution(executionData);

      expect(execution).to.have.property('id', executionData.id);
      expect(execution).to.have.property('scenario', executionData.scenario);
      expect(execution).to.have.property('configuration', executionData.configuration);
      expect(execution).to.have.property('user', executionData.user);

      expect(execution).to.have.property('starttimestamp');
      expect(execution).to.have.property('updatetimestamp');
      expect(execution).to.have.property('state');
      expect(execution).to.have.property('status');
      expect(execution).to.have.property('ok');
      expect(execution).to.have.property('partial');
      expect(execution).to.have.property('inconclusive');
      expect(execution).to.have.property('failed');
      expect(execution).to.have.property('nbstatuses');
      expect(execution).to.have.property('done');
      expect(execution).to.have.property('instances');
    });

    function testRequiredField(field) {
      return function testFunction() {
        const cloneExecutionData = Object.assign({}, executionData);
        delete cloneExecutionData[field];
        expect(() => {
          /* eslint-disable no-new */
          new Execution(cloneExecutionData);
          /* eslint-enable no-new */
        }).to.throw(Error, `${field} is required`);
      };
    }

    it('should required id field', testRequiredField('id'));
    it('should required scenario field', testRequiredField('scenario'));
    it('should required configuration field', testRequiredField('configuration'));
    it('should required user field', testRequiredField('user'));

    describe('configuration', () => {
      it('should be an object', () => {
        const cloneExecutionData = JSON.parse(JSON.stringify(executionData));
        cloneExecutionData.configuration = [];
        expect(() => {
          /* eslint-disable no-new */
          new Execution(cloneExecutionData);
          /* eslint-enable no-new */
        }).to.throw(Error, 'configuration should be a object');
      });

      function testConfigurationRequiredField(field) {
        return function testFunction() {
          const cloneExecutionData = JSON.parse(JSON.stringify(executionData));
          delete cloneExecutionData.configuration[field];
          expect(() => {
            /* eslint-disable no-new */
            new Execution(cloneExecutionData);
            /* eslint-enable no-new */
          }).to.throw(Error, `configuration.${field} is required.`);
        };
      }

      it('should required id field', testConfigurationRequiredField('id'));
      it('should required name field', testConfigurationRequiredField('name'));
      it('should required targetmode field', testConfigurationRequiredField('targetmode'));
      it('should required runmode field', testConfigurationRequiredField('runmode'));
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON', () => {
      const execution = new Execution(executionFullData);
      expect(execution.toJSON()).eql(executionFullData);
    });
  });
});