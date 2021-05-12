let env = "development";
let config = require('../knexfile')[env];
let db = require('knex')(config);

module.exports = db;