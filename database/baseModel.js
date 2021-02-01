const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('../knexfile');

const knex = Knex(knexConfig);
Model.knex(knex);
module.exports = Model
