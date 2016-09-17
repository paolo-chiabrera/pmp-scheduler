import {expect} from 'chai';
import sinon from 'sinon';

import needle from 'needle';

import mocks from '../mocks';

import getActiveSources from '../../lib/modules/getActiveSources';

describe('getActiveSources', function () {
  it('should be defined', function () {
    expect(getActiveSources).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    getActiveSources({}, cb);
  }));

  it('should return an error: needle.get', sinon.test(function (done) {
    const fakeError = new Error('error');
    const get = this.stub(needle, 'get', (url, options, callback) => {
      callback(fakeError);
    });

    const cb = this.spy(err => {
      sinon.assert.calledOnce(get);
      expect(err).to.eql(fakeError);

      get.restore();
      done();
    });

    getActiveSources({
      pmpApiUrl: mocks.options.pmpApiUrl,
      request: mocks.options.request
    }, cb);
  }));

  it('should return an error: statusCode', sinon.test(function (done) {
    const statusCode = 401;
    const statusError = new Error('wrong statusCode ' + statusCode);
    const get = this.stub(needle, 'get', (url, options, callback) => {
      callback(null, {
        statusCode: statusCode
      });
    });

    const cb = this.spy(err => {
      sinon.assert.calledOnce(get);
      expect(err).to.eql(statusError);

      get.restore();
      done();
    });

    getActiveSources({
      pmpApiUrl: mocks.options.pmpApiUrl,
      request: mocks.options.request
    }, cb);
  }));

  it('should return the active sources', sinon.test(function (done) {
    const get = this.stub(needle, 'get', (url, options, callback) => {
      callback(null, {
        statusCode: 200,
        body: []
      });
    });

    const cb = this.spy((err, res) => {
      sinon.assert.calledOnce(get);
      expect(err).to.be.a('null');
      expect(res).to.be.an('object');
      expect(res.sources).to.eql([]);

      get.restore();
      done();
    });

    getActiveSources({
      pmpApiUrl: mocks.options.pmpApiUrl,
      request: mocks.options.request
    }, cb);
  }));
});
