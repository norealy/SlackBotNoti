const BaseServer = require('../common/BaseServer');

class GoogleCalendar extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
	}

	handlerRequest(req, res) {
		return res.status(200).send("Watch request handler the Google Calendar");
	}

	watchRequestHandler(req, res, next) {
		this.handlerRequest(req, res);
	}
}

{
	const pipeline = new GoogleCalendar(process.argv[2], {
		config: {
			path: process.argv[3],
			appRoot: __dirname,
		},
	});
	pipeline.init();
}
