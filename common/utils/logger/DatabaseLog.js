const Env = require('../Env');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

function DatabaseLog() {
	let debug = /dev/i.test(Env.get('NODE_ENV', 'production'));
	if(debug) mongoose.set('debug', true);

	const opt = { useNewUrlParser: true, useUnifiedTopology: true };
	const conn = mongoose.createConnection(Env.getOrFail("DATABASE_LOG_URI"), opt);

	conn.on('connected', function () {
		console.log("connect log database success !");
	});

	conn.on('error', function (err) {
		console.log('connect log database fail !');
		throw err
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
