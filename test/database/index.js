const { Model } = require('objection');
const Env = require('../../utils/Env');
const Knex = require('knex');
const configDB = require('../../common/utils/mysql/Database')(Env.appRoot);

const mysql = Knex(configDB);
Model.knex(mysql);

module.exports = mysql;
