'use strict'

const expect = require('chai').expect
const nock = require('nock')
const M2M = require('../src')

describe('m2m', () => {
  const user = 'user'
  const password = 'password'
  const sim = '+56999999999'
  const icc = '1111111111111111111'

  describe('errors', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://www.m2mdataglobal.com')
        .post('/plataforma/login')
        .reply(200, 'Usuario o contraseña incorrectos')
    })

    it('should return empty credentials error', () => {
      try {
        new M2M() // eslint-disable-line
      } catch (err) {
        expect(err.message).to.eql('User or password is empty')
      }
    })

    it('should return wrong credentials error', done => {
      const client = new M2M({ user: user, password: password })
      client.checkSim(sim).catch(err => {
        expect(err.message).to.eql('Login failed')
        done()
      })
    })

    it('should return wrong credentials error', done => {
      const client = new M2M({ user: user, password: password })
      client.listSims().catch(err => {
        expect(err.message).to.eql('Login failed')
        done()
      })
    })

    afterEach(() => {
      nock.enableNetConnect()
      nock.cleanAll()
    })
  })

  describe('not found', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://www.m2mdataglobal.com')
        .post('/plataforma/login')
        .reply(302, '', {
          location: 'http://www.m2mdataglobal.com/plataforma/'
        })
        .get('/plataforma/sims/lista')
        .reply(200, [
          {
            s: ['1111111111111111111', '5688888888', '', '', '', '', '', ''],
            p: ['', ''],
            o: ['INACTIVE', '', '', '', '', ''],
            c: ['', '', '', '', '', ''],
            e: ['', '', '', '', '', '']
          }
        ])
    })

    it('should return not found error', done => {
      const client2 = new M2M({ user: user, password: password })
      client2.checkSim(sim).catch(err => {
        expect(err.message).to.eql('Sim +56999999999 not found or not active')
        done()
      })
    })

    afterEach(() => {
      nock.enableNetConnect()
      nock.cleanAll()
    })
  })

  describe('success', () => {
    const tidgsm = '57c060d62b2ec871fb47146a'
    const tidgprs = '57c060d62b2ec871fb47146b'
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://www.m2mdataglobal.com')
        .post('/plataforma/login')
        .reply(302, '', {
          location: 'http://www.m2mdataglobal.com/plataforma/'
        })
      nock('http://www.m2mdataglobal.com')
        .get('/plataforma/sims/lista')
        .reply(200, [
          {
            s: [
              icc,
              '56999999999',
              '',
              '123456789012345',
              'SIM840W',
              'cll',
              'l',
              'GPS_CL_20M_BAS_CH'
            ],
            p: ['', ''],
            o: ['ACTIVE', '', '', '', '', '1'],
            c: ['', '', '', '', '', ''],
            e: ['', '', '', '', '', '']
          }
        ])
      nock('http://www.m2mdataglobal.com')
        .get(`/plataforma/sims/testSim?icc=${icc}&o=clL&modo=administrative`)
        .reply(200, { globalStatus: true })
      nock('http://www.m2mdataglobal.com')
        .get(`/plataforma/sims/testSim?icc=${icc}&o=clL&modo=gsm`)
        .reply(200, { transactionId: tidgsm })
        .get(`/plataforma/sims/testSim2?tid=${tidgsm}&o=clL`)
        .reply(200, { result: 'GSM_UP' })
      nock('http://www.m2mdataglobal.com')
        .get(`/plataforma/sims/testSim?icc=${icc}&o=clL&modo=gprs`)
        .reply(200, { transactionId: tidgprs })
        .get(`/plataforma/sims/testSim2?tid=${tidgprs}&o=clL`)
        .reply(200, { result: 'GPRS_UP' })
    })

    it('should return all status by sim', done => {
      const client2 = new M2M({ user: user, password: password })
      client2
        .checkSim(sim)
        .then(result => {
          expect(result.sim).to.eql(sim)
          expect(result.status.admin).to.eql(true)
          expect(result.status.gsm).to.eql(true)
          expect(result.status.gprs).to.eql(true)
          done()
        })
        .catch(done)
    })

    it('should return all status by icc', done => {
      const client2 = new M2M({ user: user, password: password })
      client2
        .checkIcc(icc)
        .then(result => {
          expect(result.icc).to.eql(icc)
          expect(result.status.admin).to.eql(true)
          expect(result.status.gsm).to.eql(true)
          expect(result.status.gprs).to.eql(true)
          done()
        })
        .catch(done)
    })

    it('should return all sims', done => {
      const client2 = new M2M({ user: user, password: password })
      client2
        .listSims()
        .then(results => {
          expect(results[0].icc).to.eql(icc)
          expect(results[0].sim).to.eql(sim)
          done()
        })
        .catch(done)
    })

    afterEach(() => {
      nock.enableNetConnect()
      nock.cleanAll()
    })
  })
})
