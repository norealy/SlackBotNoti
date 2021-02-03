const Env = require('./utils/Env');
// Update with your config settings.
const configDB = require('./common/utils/mysql/Database')(Env.appRoot);

module.exports = configDB;
