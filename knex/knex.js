// const environment = process.env.ENVIRONMENT || 'development'
// const config = require('../knexfile.js')[environment];
// module.exports = require('knex')(config);

const knex = require('knex');
const knexConfig = require('../knexfile');
const environment = process.env.DB_ENV || 'development';
module.exports = knex(knexConfig[environment]);