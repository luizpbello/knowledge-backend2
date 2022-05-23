const config = require('../knexfile.js')
const knex = require('knex')(config)

knex.migrate.latest([config]) // MIGRANDO O BANCO DE DADOS

module.exports = knex