'use strict'

const rp = require('request-promise')

const login = data => {
  const options = {
    method: 'POST',
    url: 'http://www.m2mdataglobal.com/plataforma/login',
    form: {
      usuario: data.user,
      pass: data.password,
      entrar: 'Iniciar+sesión'
    },
    simple: false,
    resolveWithFullResponse: true
  }
  return data.rp(options).then(res => res.headers.location)
}

const getCountry = country => {
  const countries = {
    CL: 'Chile',
    CLL: 'Chile',
    CLS: 'Chile Servicios',
    MX: 'Mexico',
    MXL: 'Mexico',
    AR: 'Argentina',
    EC: 'Ecuador',
    CO: 'Colombia',
    PE: 'Peru',
    BO: 'Bolivia'
  }
  const _country = country.toUpperCase()
  return countries.hasOwnProperty(_country) ? countries[_country] : null
}

const getType = type => {
  const types = {
    g: 'Global',
    l: 'Local',
    le: 'Legacy'
  }
  return types.hasOwnProperty(type) ? types[type] : null
}

const gprsStatus = state => {
  const status = {
    '1': 'Activos',
    '2': 'Inactivos',
    '0': 'No Disponibles'
  }
  return status.hasOwnProperty(state) ? status[state] : null
}

const parseResult = data => {
  return {
    icc: data.s[0],
    sim: `+${data.s[1]}`,
    imei: data.s[3] !== '' ? data.s[3] : null,
    device: data.s[4] !== '' ? data.s[4] : null,
    country: getCountry(data.s[5]),
    type: getType(data.s[6]),
    plan: data.s[7] !== '' ? data.s[7] : null,
    customs: data.p,
    provider: {
      state: data.o[0],
      ip: data.o[1],
      apn: data.o[2],
      country: getCountry(data.o[3]),
      operator: data.o[4],
      gprs: gprsStatus(data.o[5])
    },
    traffic: {
      monthly: {
        voice: data.c[0],
        data: data.c[1],
        sms: data.c[2]
      },
      daily: {
        voice: data.c[3],
        data: data.c[4],
        sms: data.c[5]
      }
    },
    enterprise: data.e[0]
  }
}

const sims = data => {
  const options = {
    url: 'http://www.m2mdataglobal.com/plataforma/sims/lista',
    json: true
  }
  return data.rp(options).then(results => results.map(x => parseResult(x)))
}

const getSim = data => {
  return sims(data).then(results => {
    return results.find(x => {
      const key = typeof data.sim !== 'undefined' ? 'sim' : 'icc'
      const value = typeof data.sim !== 'undefined' ? data.sim : data.icc
      return x[key] === value
    })
  })
}

const testSim = (data, mode) => {
  const options = {
    url: 'http://www.m2mdataglobal.com/plataforma/sims/testSim',
    qs: { icc: data.icc, o: data.o || 'clL', modo: mode },
    json: true
  }
  return data.rp(options)
}

const testSim2 = (data, mode) => {
  const success = {
    gsm: 'GSM_UP',
    gprs: 'GPRS_UP'
  }
  return testSim(data, mode)
    .then(res => res.transactionId)
    .then(transactionId => {
      const options = {
        url: 'http://www.m2mdataglobal.com/plataforma/sims/testSim2',
        qs: { tid: transactionId, o: data.o || 'clL' },
        json: true
      }
      return data.rp(options)
    })
    .then(res => res.result === success[mode])
}

const checkAdmin = data => {
  return testSim(data, 'administrative').then(res => res.globalStatus === true)
}

const getStatus = options => {
  options.rp = rp.defaults({ jar: true })
  return login(options)
    .then(result => {
      if (!result) return Promise.reject(new Error('Login failed'))
      return getSim(options)
    })
    .then(data => {
      if (typeof data === 'undefined') {
        return Promise.reject(
          new Error(`Sim ${options.sim} not found or not active`)
        )
      }
      options.icc = data.icc
      const promises = [
        checkAdmin(options),
        testSim2(options, 'gsm'),
        testSim2(options, 'gprs'),
        Promise.resolve(data)
      ]
      return Promise.all(promises)
    })
    .then(results => {
      const data = results[3]
      data.status = {
        admin: results[0],
        gsm: results[1],
        gprs: results[2]
      }
      return data
    })
}

const listSims = data => {
  data.rp = rp.defaults({ jar: true })
  return login(data).then(result => {
    if (!result) return Promise.reject(new Error('Login failed'))
    return sims(data)
  })
}

module.exports = {
  getStatus: getStatus,
  listSims: listSims
}
