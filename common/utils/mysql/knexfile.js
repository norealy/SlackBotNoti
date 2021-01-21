// Update with your config settings.
const configDB = require('./Database')(__dirname);

module.exports = {
	development: configDB,
	production: configDB,
	staging: configDB
};
