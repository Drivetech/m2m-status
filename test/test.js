'use strict';

const expect = require('chai').expect;
const nock = require('nock');
const m2m = require('../src');

describe('m2m', () => {
  const user = 'user';
  const password = 'password';
  const sim = '+56999999999';

  describe('errors', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://m2mdataglobal.com')
        .post('/plataforma/login')
        .reply(200, 'Usuario o contraseña incorrectos');
    });

    it('should return empty credentials error', () => {
      try {
        new m2m();
      } catch(err) {
        expect(err.message).to.eql('User or password is empty');
      }
    });

    it('should return wrong credentials error', done => {
      const client = new m2m({user: user, password: password});
      client.checkSim(sim).catch(err => {
        expect(err.message).to.eql('Login failed');
        done();
      });
    });

    afterEach(() => {
      nock.enableNetConnect();
      nock.cleanAll();
    });
  });

  describe('not found', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://m2mdataglobal.com')
        .post('/plataforma/login')
        .reply(200, 'location.href = http://m2mdataglobal.com/plataforma/')
        .get('/plataforma/sims/lista')
        .reply(200, [{s: ['1111111111111111111', '5688888888'], o: ['INACTIVE']}]);
    });

    it('should return not found error', done => {
      const client2 = new m2m({user: user, password: password});
      client2.checkSim(sim).catch(err => {
        expect(err.message).to.eql('Sim +56999999999 not found or not active');
        done();
      });
    });

    afterEach(() => {
      nock.enableNetConnect();
      nock.cleanAll();
    });
  });

  describe('success', () => {
    const icc = '1111111111111111111';
    const tidgsm = '57c060d62b2ec871fb47146a';
    const tidgprs = '57c060d62b2ec871fb47146b';
    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://m2mdataglobal.com')
        .post('/plataforma/login')
        .reply(200, 'location.href = http://m2mdataglobal.com/plataforma/');
      nock('http://m2mdataglobal.com')
        .get('/plataforma/sims/lista')
        .reply(200, [{s: [icc, '56999999999'], o: ['ACTIVE']}]);
      nock('http://m2mdataglobal.com')
        .get(`/plataforma/sims/testSim?icc=${icc}&o=clL&modo=administrative`)
        .reply(200, {globalStatus: true});
      nock('http://m2mdataglobal.com')
        .get(`/plataforma/sims/testSim?icc=${icc}&o=clL&modo=gsm`)
        .reply(200, {transactionId: tidgsm})
        .get(`/plataforma/sims/testSim2?tid=${tidgsm}&o=clL`)
        .reply(200, {result: 'GSM_UP'});
      nock('http://m2mdataglobal.com')
        .get(`/plataforma/sims/testSim?icc=${icc}&o=clL&modo=gprs`)
        .reply(200, {transactionId: tidgprs})
        .get(`/plataforma/sims/testSim2?tid=${tidgprs}&o=clL`)
        .reply(200, {result: 'GPRS_UP'});
    });

    it('should return all status', done => {
      const client2 = new m2m({user: user, password: password});
      client2.checkSim(sim).then(result => {
        expect(result.admin).to.be.true;
        expect(result.gsm).to.be.true;
        expect(result.gprs).to.be.true;
        done();
      }).catch(done);
    });

    afterEach(() => {
      nock.enableNetConnect();
      nock.cleanAll();
    });
  });
});
