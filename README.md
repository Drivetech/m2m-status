# m2m-status

[![npm version](https://img.shields.io/npm/v/m2m-status.svg?style=flat-square)](https://www.npmjs.com/package/m2m-status)
[![npm downloads](https://img.shields.io/npm/dm/m2m-status.svg?style=flat-square)](https://www.npmjs.com/package/m2m-status)
[![Build Status](https://img.shields.io/travis/lgaticaq/m2m-status.svg?style=flat-square)](https://travis-ci.org/lgaticaq/m2m-status)
[![Coverage Status](https://img.shields.io/coveralls/lgaticaq/m2m-status/master.svg?style=flat-square)](https://coveralls.io/github/lgaticaq/m2m-status?branch=master)
[![Code Climate](https://img.shields.io/codeclimate/github/lgaticaq/m2m-status.svg?style=flat-square)](https://codeclimate.com/github/lgaticaq/m2m-status)
[![dependency Status](https://img.shields.io/david/lgaticaq/m2m-status.svg?style=flat-square)](https://david-dm.org/lgaticaq/m2m-status#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/lgaticaq/m2m-status.svg?style=flat-square)](https://david-dm.org/lgaticaq/m2m-status#info=devDependencies)

> Check status of your m2m-status sims

## Installation

```bash
npm i -S m2m-status
```

## Use

[Try on Tonic](https://tonicdev.com/npm/m2m-status)
```js
const m2m = require('m2m-status');

const user = 'your-user';
const password = 'your-password';
const sim = '+569XXXXXXXX';

const client = new m2m({user: user, password: password});
client.checkSim(sim).then(console.log).catch(console.error);
```

## License

[MIT](https://tldrlegal.com/license/mit-license)
