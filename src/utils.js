'use strict';

const rp = require('request-promise');

const login = data => {
  const options = {
    method: 'POST',
    url: 'http://m2mdataglobal.com/plataforma/login',
    form: {
      usuario: data.user,
      pass: data.password,
      entrar: 'Iniciar+sesión'
    }
  };
  return data.rp(options).then(res => /location\.href/.test(res));
};

const sims = data => {
  const options = {
    url: 'http://m2mdataglobal.com/plataforma/sims/lista',
    json: true
  };
  return data.rp(options);
};

const getIcc = data => {
  return sims(data)
    .then(results => {
      return results
        .find(x => x.s[1] === data.sim.replace('+', ''));
    })
    .then(result => result ? result.s[0] : null);
};

const testSim = (data, mode) => {
  const options = {
    url: 'http://m2mdataglobal.com/plataforma/sims/testSim',
    qs: {icc: data.icc, o: data.o || 'clL', modo: mode},
    json: true
  };
  return data.rp(options);
};

const testSim2 = (data, mode) => {
  const success = {
    'gsm': 'GSM_UP',
    'gprs': 'GPRS_UP'
  };
  return testSim(data, mode)
    .then(res => res.transactionId)
    .then(transactionId => {
      const options = {
        url: 'http://m2mdataglobal.com/plataforma/sims/testSim2',
        qs: {tid: transactionId, o: data.o || 'clL'},
        json: true
      };
      return data.rp(options);
    })
    .then(res => res.result === success[mode]);
};

const checkAdmin = data => {
  return testSim(data, 'administrative').then(res => res.globalStatus === true);
};

const getStatus = data => {
  data.rp = rp.defaults({jar: true});
  return login(data)
    .then(result => {
      if (!result) return Promise.reject(new Error('Login failed'));
      return getIcc(data);
    })
    .then(icc => {
      if (icc === null) return Promise.reject(new Error(`Sim ${data.sim} not found or not active`));
      data.icc = icc;
      const promises = [checkAdmin(data), testSim2(data, 'gsm'), testSim2(data, 'gprs')];
      return Promise.all(promises);
    })
    .then(results => ({admin: results[0], gsm: results[1], gprs: results[2]}));
};

module.exports = {
  getStatus: getStatus
};
