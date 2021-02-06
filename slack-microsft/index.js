const BaseServer = require('../common/BaseServer');
const Axios = require('axios');
const Env = require('../utils/Env');
const viewsDesign = require('../views/ViewsDesign');
const tokenBot = Env.getOrFail("TOKEN_BOT")
const Auth = require('./Auth');

class SlackMicrosoft extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
	}

	async chatServiceHandler(req, res, next) {
		console.log("---chatServiceHandler---")

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

		} else if (payload.type === 'block_actions') {
			if (payload.actions[0].action_id === "addMicrosoft") {
				const options = {
					method: 'GET',
					url: `http://localhost:5100/microsoft`
				};
				await Axios(options);
				console.log("addMicrosoft")
			}
			else if (payload.actions[0].action_id === "addGoogle") {
				console.log("addGoogle")
			}
		}
		return res.status(200).send("Watch request handler the Microsoft Outlook Calendar");
	}

	async resourceServerHandler(req, res, next) {
		try {
			console.log("======= resource Server Handler =======");
			const challenge = req.body.challenge;
			const event = req.body.event;
			if (challenge) {
				return res.status(200).send(challenge);
			}
			else if (event && (event.subtype === 'bot_add' ||(event.subtype === 'channel_join' && event.user===Env.getOrFail("USER_BOT")))) {
				const options = {
					method: 'POST',
					headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${tokenBot}` },
					data: {
						"channel": req.body.event.channel,
						"blocks": viewsDesign.settingMessCal
					},
					url: "https://slack.com/api/chat.postMessage",
				};
				const result = await Axios(options);
				console.log("data", result.data);
			}
			return res.status(204).send("OK");
		} catch (e) {
			console.log(e)
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
	await pipeline.init();
	pipeline.app.get('/microsoft', Auth.redirectMicrosoft);
	pipeline.app.get('/auth/microsoft', Auth.sendCode);
	pipeline.app.post('/code', Auth.getAccessToken);

})();
