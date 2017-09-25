'use strict'

const utils = require('./utils')

class Client {
  constructor (data) {
    if (!data || !data.user || !data.password) {
      throw new Error('User or password is empty')
    }
    this.user = data.user
    this.password = data.password
  }
  getCredentials () {
    return { user: this.user, password: this.password }
  }
  listSims () {
    return utils.listSims(this.getCredentials())
  }
  checkSim (sim) {
    const data = this.getCredentials()
    data.sim = sim
    return utils.getStatus(data)
  }
  checkIcc (icc) {
    const data = this.getCredentials()
    data.icc = icc
    return utils.getStatus(data)
  }
}

module.exports = Client
