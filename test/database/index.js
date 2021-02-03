const { Model } = require('objection');
const Env = require('../../utils/Env');
const Knex = require('knex');
const appRoot = Env.get("PWD", null) || Env.getOrFail("I")
const configMySQL = require('../../common/utils/mysql/Database')(appRoot);

const mysql = Knex(configMySQL);
Model.knex(mysql);

mysql.raw("SELECT VERSION()")
    .then(() => {
        return resolve(1)
    })
    .catch((err) => {
        const code = "E_ACCESS_MYSQL_ERROR";
        const message = err.sqlMessage ? err.sqlMessage : 'Access to mysql database denied';
        const error = new Error(`${code}: ${message}`);
        error.code = code;
        reject(error)
    });