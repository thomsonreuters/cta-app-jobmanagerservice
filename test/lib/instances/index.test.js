'use strict';

const instances = require('../../../lib/instances');
const configHelper = require('../../../lib/helpers/config.helper');
const nock = require('nock');
const httpStatus = require('http-status');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const sinon = require('sinon');

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Instances', () => {
  describe('getMatchingInstances', () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should throw error if no properties query', () => {
      sandbox.stub(configHelper, 'getInstancesUrl').returns('http://abc.com/instances');
      const testData = { };

      return expect(instances.getMatchingInstances(testData))
        .to.be.rejected.and.then((reason) => {
          expect(reason.err).to.not.be.a('null');
        });
    });
    it('should get successfully if there are any property query', () => {
      sandbox.stub(configHelper, 'getInstancesUrl').returns('http://abc.com/instances');
      const matchingData = {
        type: 'physical',
        properties: [
          {
            name: 'testname1',
            value: 'testvalue1',
          },
        ],
      };
      const nockInstancesGetReq = nock(configHelper.getInstancesUrl())
        .post('/matchingInstances', matchingData)
        .reply(httpStatus.OK, ['hostname1', 'hostname2']);

      return expect(instances.getMatchingInstances(matchingData))
        .to.be.fulfilled.and.then((result) => {
          expect(result.statusCode).equal(httpStatus.OK);
          expect(result.instances).to.be.an('array');
          expect(nockInstancesGetReq.isDone()).equal(true);
        });
    });

    describe('Errors', () => {
      it('should handle httpStatus 500+ error', () => {
        sandbox.stub(configHelper, 'getInstancesUrl').returns('http://abc.com/instances');
        const matchingData = {
          type: 'physical',
          properties: [
            {
              name: 'testname1',
              value: 'testvalue1',
            },
          ],
        };
        const nockExecutionPostReq = nock(configHelper.getInstancesUrl())
          .post('/matchingInstances', matchingData)
          .reply(httpStatus.INTERNAL_SERVER_ERROR);

        return expect(instances.getMatchingInstances(matchingData))
          .to.be.rejected.and.then((reason) => {
            expect(reason.statusCode).equal(httpStatus.INTERNAL_SERVER_ERROR);

            expect(nockExecutionPostReq.isDone()).equal(true);
          });
      });

      it('should handle httpStatus 400+ error', () => {
        sandbox.stub(configHelper, 'getInstancesUrl').returns('http://abc.com/instances');
        const matchingData = {
          type: 'physical',
          properties: [
            {
              name: 'testname1',
              value: 'testvalue1',
            },
          ],
        };
        const nockExecutionPostReq = nock(configHelper.getInstancesUrl())
          .post('/matchingInstances', matchingData)
          .reply(httpStatus.BAD_REQUEST);

        return expect(instances.getMatchingInstances(matchingData))
          .to.be.rejected.and.then((reason) => {
            expect(reason.statusCode).equal(httpStatus.BAD_REQUEST);

            expect(nockExecutionPostReq.isDone()).equal(true);
          });
      });

      it('should handle error', () => {
        sandbox.stub(configHelper, 'getInstancesUrl').returns('http://abc.com/instances');
        const matchingData = {
          type: 'physical',
          properties: [
            {
              name: 'testname1',
              value: 'testvalue1',
            },
          ],
        };
        const nockExecutionPostReq = nock(configHelper.getInstancesUrl())
          .post('/matchingInstances', matchingData)
          .replyWithError({ code: 'ECONNRESET' });

        return expect(instances.getMatchingInstances(matchingData))
          .to.be.rejected.and.then((reason) => {
            expect(reason.code).equal('ECONNRESET');

            expect(nockExecutionPostReq.isDone()).equal(true);
          });
      });
    });
  });
});
