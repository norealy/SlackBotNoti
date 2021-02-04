const BaseServer = require('../../common/BaseServer');

class SlackGoogle extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
	}

	chatServiceHandler(req, res, next) {
		return res.status(200).send("Watch request handler the Google Calendar");
	}

	resourceServerHandler(req, res, next){
		try{
			return res.status(204).send("OK");
		}catch (e) {
			return res.status(204).send("ERROR");
		}
	}
}

module.exports = SlackGoogle;

(async function() {
	const pipeline = new SlackGoogle(process.argv[2], {
		config: {
			path: process.argv[3],
			appRoot: __dirname,
		},
	});
	await pipeline.init();
})();
