// const environment = process.env.ENVIRONMENT || 'development'
// const config = require('../knexfile.js')[environment];
// export default require('knex')(config);

import knex from 'knex'
import knexfile from '../knexfile.js'

const myKnex = knex(knexfile.development)

export default myKnex