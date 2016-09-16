import {expect} from 'chai';
import sinon from 'sinon';

import main from '../lib/modules/main';

//import mocks from './mocks';

import PmpScheduler from '../lib/index';

describe('pmp-scheduler', function () {
  let pmpScheduler;

  beforeEach(function () {
    pmpScheduler = new PmpScheduler({
      pmpApiUrl: 'http://test.io',
      request: {
        headers: {
          'Authorization': 'test'
        }
      }
    });
  });

  it('should be defined', function () {
    expect(pmpScheduler).to.be.an('object');
  });

  describe('constructor', function () {
    it('should set all the properties', function () {
      expect(pmpScheduler.options).to.be.an('object');
      expect(pmpScheduler.options.pmpApiUrl).to.equal('http://test.io');
      expect(pmpScheduler.options.refreshInterval).to.be.a('number');
      expect(pmpScheduler.options.request).to.be.an('object');
      expect(pmpScheduler.options.request.json).to.be.a('boolean');
      expect(pmpScheduler.options.request.headers).to.be.an('object');
      expect(pmpScheduler.options.request.headers.Authorization).to.eql('test');

      expect(pmpScheduler.activeSources).to.eql([]);
      expect(pmpScheduler.jobs).to.eql({});
      expect(pmpScheduler.process).to.eql({});
    });
  });

  describe('clearJobs', function () {
    it('should be defined', function () {
      expect(pmpScheduler.clearJobs).to.be.a('function');
    });

    it('should cancel all the jobs', sinon.test(function (done) {
      const cancelJob = this.spy();

      pmpScheduler.jobs = {
        one: {
          cancel: cancelJob
        },
        two: {
          cancel: cancelJob
        }
      };

      pmpScheduler.clearJobs();

      sinon.assert.calledTwice(cancelJob);

      expect(pmpScheduler.jobs).to.eql({});

      done();
    }));
  });

  describe('clearProcesses', function () {
    it('should be defined', function () {
      expect(pmpScheduler.clearProcesses).to.be.a('function');
    });

    it('should cancel all the processes', sinon.test(function (done) {
      const kill = this.spy();

      pmpScheduler.process = {
        one: {
          kill
        },
        two: {
          kill
        }
      };

      pmpScheduler.clearProcesses();

      sinon.assert.calledTwice(kill);

      expect(pmpScheduler.process).to.eql({});

      done();
    }));
  });

  describe('setupJobs', function () {
    it('should be defined', function () {
      expect(pmpScheduler.setupJobs).to.be.a('function');
    });

    it('should setup the jobs', sinon.test(function (done) {
      const clearJobs = this.stub(pmpScheduler, 'clearJobs');
      const clearProcesses = this.stub(pmpScheduler, 'clearProcesses');

      const emit = this.stub(pmpScheduler, 'emit', (name, jobs) => {
        expect(name).to.equal('jobs');
        expect(jobs).to.eql({});
        expect(pmpScheduler.jobs).to.eql({});

        sinon.assert.calledOnce(clearJobs);
        sinon.assert.calledOnce(clearProcesses);

        clearJobs.restore();
        clearProcesses.restore();
        emit.restore();
        done();
      });

      pmpScheduler.setupJobs();
    }));
  });

  describe('updateSchedule', function () {
    it('should be defined', function () {
      expect(pmpScheduler.updateSchedule).to.be.a('function');
    });

    it('should emit an error: getActiveSources', sinon.test(function (done) {
      const fakeError = new Error('error');
      const getActiveSources = this.stub(main, 'getActiveSources', (args, callback) => {
        callback(fakeError);
      });
      const emit = this.stub(pmpScheduler, 'emit', (name, err) => {
        expect(name).to.equal('error');
        expect(err).to.eql(fakeError);

        getActiveSources.restore();
        emit.restore();
        done();
      });

      pmpScheduler.updateSchedule();
    }));

    it('should emit the sources', sinon.test(function (done) {
      const getActiveSources = this.stub(main, 'getActiveSources', (args, callback) => {
        callback(null, {
          sources: [{
            id: 'test'
          }]
        });
      });
      const setupJobs = this.stub(pmpScheduler, 'setupJobs');
      const emit = this.stub(pmpScheduler, 'emit', (name, sources) => {
        expect(name).to.equal('sources');
        expect(sources).to.eql([{
          id: 'test'
        }]);

        getActiveSources.restore();
        setupJobs.restore();
        emit.restore();
        done();
      });

      pmpScheduler.updateSchedule();
    }));
  });

  describe('init', function () {
    it('should be defined', function () {
      expect(pmpScheduler.init).to.be.a('function');
    });

    it('should call updateSchedule', sinon.test(function (done) {
      const updateSchedule = this.stub(pmpScheduler, 'updateSchedule');

      pmpScheduler.init();

      sinon.assert.calledOnce(updateSchedule);

      updateSchedule.restore();

      done();
    }));
  });
});
