const M2M = require('m2m-status')

const user = 'your-user'
const password = 'your-password'
const sim = '+569XXXXXXXX'

const client = new M2M({user: user, password: password})
await client.checkSim(sim)
