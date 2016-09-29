'use strict';

const utils = require('./utils');

class Client {
  constructor(data) {
    if (!data || !data.user || !data.password) throw new Error('User or password is empty');
    this.user = data.user;
    this.password = data.password;
  }
  checkSim(sim) {
    const data = {
      user: this.user,
      password: this.password,
      sim: sim
    };
    return utils.getStatus(data);
  }
  checkIcc(icc) {
    const data = {
      user: this.user,
      password: this.password,
      icc: icc
    };
    return utils.getStatus(data);
  }
}

module.exports = Client;
