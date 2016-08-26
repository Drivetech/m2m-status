const m2m = require('m2m-status');

const user = 'your-user';
const password = 'your-password';
const sim = '+569XXXXXXXX';

const client = new m2m({user: user, password: password});
await client.checkSim(sim);
