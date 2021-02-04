const Env = require('../../../utils/Env');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

function DatabaseLog() {
	if(Env.get('LOG_DATABASE_DEBUG', false)) mongoose.set('debug', true);

	const opt = { useNewUrlParser: true, useUnifiedTopology: true };
	const conn = mongoose.createConnection(Env.getOrFail("LOG_DATABASE_URI"), opt);

	conn.on('connected', function () {
		console.log("connect database log success !");
	});

	conn.on('error', function (err) {
		const code = 'E_CONNECT_DATABASE_LOG';
		const error = new Error(`${code}: ${err.message}`);
		error.code = code;
		throw error
	});

	const close = () => {
		conn.close(function () {
			process.off('SIGINT', close);
			console.log('Log database disconnected through app termination');
		});
	}

	process.on('SIGINT', close);

	return conn;
}
module.exports = DatabaseLog();
