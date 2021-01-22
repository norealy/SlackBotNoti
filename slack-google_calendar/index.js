const BaseServer = require('../common/BaseServer');
const Axios = require('axios');
const Env = require('../utils/Env');

class SlackGoogleCalendar extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
	}

	handlerRequest(req, res) {
		return res.status(200).send("Watch request handler the Google Calendar");
	}

	watchRequestHandler(req, res, next) {
		this.handlerRequest(req, res);
	}

	async watchResponseHandler(req, res, next){
		try{
			return res.status(204).send("OK");
		}catch (e) {
			return res.status(204).send("ERROR");
		}
	}
}

module.exports = SlackGoogleCalendar;

(async function() {
	const pipeline = new SlackGoogleCalendar(process.argv[2], {
		config: {
			path: process.argv[3],
			appRoot: __dirname,
		},
	});
	await pipeline.init();
})();
