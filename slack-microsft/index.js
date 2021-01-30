const BaseServer = require('../common/BaseServer');
const Axios = require('axios');
const Env = require('../utils/Env');
const viewsDesign = require('../views/ViewsDesign');
const tokenBot = Env.getOrFail("TOKEN_BOT")
const Auth = require('./Auth');
// const axios = require('axios');

class SlackMicrosoft extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
	}

	async chatServiceHandler(req, res, next) {
		console.log("---body---")
		console.log(req.body)
		
		let payload = req.body.payload;
		if (typeof payload !== 'undefined') {
			payload = JSON.parse(payload);
		}

		if (!req.body.payload) {
			if (req.body.text.split(" ")[0] === "settings") {
				const data = {
					"trigger_id": req.body.trigger_id,
					"view": viewsDesign.addCalendarToChannel
				}
				const options = {
					method: 'POST',
					headers: { 'Authorization': `Bearer ${tokenBot}` },
					data: data,
					url: `https://slack.com/api/views.open`
				};
				const result = await Axios(options);

				console.log(result.data)

				return res.status(202).send(`Thank you call BOT-NOTI !
			If you want assistance please enter: /cal --help`);
			}

		} else if ( payload.type === 'block_actions') {
			if (payload.actions[0].action_id === "addMicrosoft") {
				const options = {
					method: 'GET',
					url: `http://localhost:5100/outlook`
				};
				const result = await Axios(options);
				console.log("addMicrosoft")
            }
			else if (payload.actions[0].action_id === "addGoogle") {
				console.log("addGoogle")
            }
		}
		return res.status(200).send("Watch request handler the Microsoft Outlook Calendar");
	}

	resourceServerHandler(req, res, next) {
		try {
			console.log("---resourceServerHandler---");

			const challenge = req.body.challenge;
			if (challenge) {
				return res.status(200).send(challenge);
			}

			return res.status(204).send("OK");
		} catch (e) {
			return res.status(204).send("ERROR");
		}
	}
}

module.exports = SlackMicrosoft;

(async function () {
	const pipeline = new SlackMicrosoft(process.argv[2], {
		config: {
			path: process.argv[3],
			appRoot: __dirname,
		},
	});

	pipeline.app.get('/auth/microsoft',(req,res,next)=>{
		console.log("CODE:",req.query.code);
		next();
	} ,Auth.sendCode);
	await pipeline.init();
})();
