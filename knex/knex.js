// const environment = process.env.ENVIRONMENT || 'development'
// const config = require('../knexfile.js')[environment];
// export default require('knex')(config);

import knex from 'knex'
import development from '../knexfile.js'

const Knex = knex(development)

export default knex