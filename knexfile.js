const Env = require('./utils/Env');
// Update with your config settings.
const configDB = require('./config/MySQL')(Env.appRoot);

module.exports = configDB;
