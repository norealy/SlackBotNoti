const BaseServer = require('../common/BaseServer');
const Axios = require('axios');
const jwt = require('jsonwebtoken');
const Env = require('../utils/Env');
const Template = require('./views/Template');
const auth = require('./auth');

class SlackGoogle extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.sendCode = this.sendCode.bind(this)
		this.getAccessToken = this.getAccessToken.bind(this)
		this.template = Template();
	}
	async chatServiceHandler(req, res, next) {
		const {challenge = null, event = null} = req.body
		//console.log(req.body)
		let payload = req.body.payload;
		try {
			//const challenge = req.body.challenge;
			if (challenge) {
			//	console.log(challenge);
				return res.status(200).send(challenge);
			}
			else if (event && (event.subtype === 'bot_add' || (event.subtype === 'app_conversation_join' || (event.subtype==='channel_join') && event.user === Env.chatServiceGet("USER_BOT")))) {
				const option = {
					method: "POST",
					headers: {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`},
					data: {
						"channel": event.channel,
						"blocks": Template().loginResource,
					},
					url: `https://slack.com/api/chat.postMessage`
				}
				console.log(option.data);
				const idUserSlack = event.inviter;
				const idChannel = event.channel;
				//console.log(event)
				const accessToken = jwt.sign({
					header: {alg: "HS256", typ: "JWT"},
					payload: {idUserSlack: idUserSlack, idChannel: idChannel},
					expiresIn: Env.serverGet("JWT_DURATION")
				}, Env.serverGet("JWT_KEY"))
				//console.log(accessToken);
				// Giải Mã
				// const verify = 	jwt.verify(accessToken,Env.serverGet("JWT_KEY"))
				// const found  = verify.payload.idUserSlack;
				// const found1 = verify.payload.idChannel;
				// console.log(`${found} + ${found1}`);
				const urlRequestAuthor = `https://accounts.google.com/signin/oauth?access_type=${Env.resourceServerGet("ACCESE_TYPE")}&scope=${Env.resourceServerGet("SCOPE_GOOGLE")}&response_type=${Env.resourceServerGet("RESPONSE_TYPE")}&client_id=${Env.resourceServerGet("GOOGLE_CLIENT_ID")}&redirect_uri=${Env.resourceServerGet("REDIRECT_URI")}&state=${accessToken}`;
				option.data.blocks[3].elements[0].url = urlRequestAuthor
				//console.log(event);
				const done = await Axios(option);
				//	console.log(done)
				return res.status(200).send("done");
			}
			let viewsAdd = Object.assign({}, Template().addEvent);
			if (typeof payload !== 'undefined') {
				payload = JSON.parse(payload);
			}
			if (!req.body.payload) {
				if (req.body.text.split(" ")[0] === "home") {
					const data = {
						"user_id": req.body.user_id,
						"trigger_id": req.body.trigger_id,
						"view": Template().homePage,
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`},
						data: data,
						url: "https://slack.com/api/views.publish"
					};
					const result = await Axios(options);
					//	console.log(result);
					return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter: /cal --help`);
				} else if (req.body.text.split(" ")[0] === "settings") {
					const data = {
						"trigger_id": req.body.trigger_id,
						"view": Template().systemSetting,
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`},
						data: data,
						url: `https://slack.com/api/views.open`
					};
					const idChannel = req.body.channel_id;
					const idUser = req.body.user_id;
					const accessToken = jwt.sign({
						header: {alg: "HS256", typ: "JWT"},
						payload: {idUserSlack: idUser, idChannel: idChannel},
						expiresIn: Env.serverGet("JWT_DURATION")
					}, Env.serverGet("JWT_KEY"))
					const urlRequestAuthor = `https://accounts.google.com/signin/oauth?access_type=${Env.resourceServerGet("ACCESE_TYPE")}&scope=${Env.resourceServerGet("SCOPE_GOOGLE")}&response_type=${Env.resourceServerGet("RESPONSE_TYPE")}&client_id=${Env.resourceServerGet("GOOGLE_CLIENT_ID")}&redirect_uri=${Env.resourceServerGet("REDIRECT_URI")}&state=${accessToken}`;

					options.data.view.blocks[3].elements[0].url = urlRequestAuthor
					const result = await Axios(options);

					return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter: /cal --help`);
				} else if (req.body.text.split(" ")[0] === "add-event") {
					viewsAdd.blocks.splice(5, 0, Template().eventTimeEnd);
					viewsAdd.blocks.splice(5, 0, Template().eventTimeStart);
					//	console.log(req.body);
					const data = {
						"trigger_id": req.body.trigger_id,
						"view": viewsAdd
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`},
						data: data,
						url: `https://slack.com/api/views.open`
					};
					const result = await Axios(options);
					//  console.log(result.data)
					return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter: /cal --help`);
				} else if (req.body.text.split(" ")[0] === "all") {
					//	console.log(req.body);
					const data = {
						"channel": req.body.channel_id,
						"blocks": Template().listCalendar,
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`},
						data: data,
						url: `https://slack.com/api/chat.postMessage`
					};
					const result = await Axios(options);
					//console.log(result);
					return res.status(202).send(`Thank you call BOT-NOTI !
                        If you want assistance please enter:  /cal --help`);
				} else if (req.body.text.split(" ")[0] === "--help") {
					return res.status(202).send(`Thank you use BOT-NOTI !
                ----------------------------------------------------
                Settings calendar to Channel : /cal settings
                Add event calendar : /cal add-event
                List calendar  : /cal all
                If you want assistance please enter:  /cal --help`);

				}
			} else if (payload.type === 'block_actions') {
				let data, url;
				if (payload.actions[0].action_id === 'allday') {
					viewsAdd.blocks = payload.view.blocks;
					url = `https://slack.com/api/views.update`;
					if (payload.actions[0].selected_options.length > 0) {
						//	console.log("all day true")
						viewsAdd.blocks.splice(5, 2);
						viewsAdd.blocks.splice(5, 0, Template().eventEndDate);
					} else if (payload.actions[0].selected_options.length === 0) {
						//	console.log("all day false")
						viewsAdd.blocks.splice(5, 1);
						viewsAdd.blocks.splice(5, 0, Template().eventTimeEnd);
						viewsAdd.blocks.splice(5, 0, Template().eventTimeStart);
					}
					data = {
						"view_id": payload["container"]["view_id"],
						"view": viewsAdd
					}

				} else if (payload.actions[0].action_id === "buttonSubmit") {
					//	console.log(payload)
					data = {
						"trigger_id": req.body.trigger_id,
						"channel": payload.channel.id,
						"blocks": Template().listEvent
					}
					url = `https://slack.com/api/chat.postMessage`;
				} else if (payload.actions[0].action_id === "buttonDelete") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": Template().deleteEvent,
					}
					url = `https://slack.com/api/views.push`;
				} else if (payload.actions[0].action_id === "buttonUpdate") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": Template().editEvent,
					}
					url = `https://slack.com/api/views.open`;
				} else if (payload.actions[0].action_id === 'deleteOK') {
					//		console.log(payload)
					url = `https://slack.com/api/views.open`;
					data = {
						"view_id": payload["container"]["view_id"],
						"view": payload.view
					}
				}
				// code Home
				else if (payload.actions[0].action_id === "btnToday") {
					//	console.log(payload);
					data = {
						"trigger_id": req.body.trigger_id,
						"channel": payload.channel.id,
						"blocks": Template().listEvent
					}
					url = `https://slack.com/api/chat.postMessage`;
				} else if (payload.actions[0].action_id === "btnTomorrow") {
					data = {
						"trigger_id": req.body.trigger_id,
						"channel": payload.channel.id,
						"blocks": Template().listEvent
					}
					url = `https://slack.com/api/chat.postMessage`;
				} else if (payload.actions[0].action_id === "btnEventAdd") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": Template().addEvent,
					}
					url = `https://slack.com/api/views.open`;
				} else if (payload.actions[0].action_id === "btnSettings") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": Template().systemSetting
					}
					url = `https://slack.com/api/views.open`;
				} else if (payload.actions[0].action_id === "overflow-action") {
					//	console.log(payload.actions[0].selected_option);
					if (payload.actions[0].selected_option.value === 'value-1') {
						data = {
							"trigger_id": payload.trigger_id,
							"view":Template().deleteEvent
						}
						url = `https://slack.com/api/views.open`;
					} else {
						data = {
							"trigger_id": payload.trigger_id,
							"view": Template().showEvent
						}
						url = `https://slack.com/api/views.open`;
					}
				}
				const options = {
					method: 'POST',
					"user_id": req.body.user_id,
					headers: {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`},
					data: data,
					url: url
				};
				const result = await Axios(options);
				//console.log(result.data)
				return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter:  /cal --help`);
			} else if (payload.type === 'view_submission') {
				//	console.log("view_submission close !")
				const data = {
					"trigger_id": req.trigger_id,
					"view": payload.view
				}
				const options = {
					method: 'POST',
					headers: {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`},
					data: data,
					url: `https://slack.com/api/views.push`
				};
				const result = await Axios(options);
				return res.status(202).send({
					"response_action": "clear"
				});
			} else {
				return res.status(202).send(`Please  use syntax BOT-NOTI !
            ----------------------------------------------------
            Settings calendar to Channel : /cal settings
            Add event calendar : /cal add-event
            List calendar  : /cal all
            If you want assistance please enter:  /cal --help`);
			}
		} catch (error) {
			//console.log(error)
			return res.status(403).send("Error");
		}
	}

	async sendCode(req, res) {
		auth.sendCode(req, res);
	}
	async getAccessToken(req, res) {
		auth.getAccessToken(req, res);
	}

	resourceServerHandler(req, res, next) {
		try {
			return res.status(204).send("OK");
		} catch (e) {
			return res.status(204).send("ERROR");
		}
	}
}
module.exports = SlackGoogle;
(async function () {
	const pipeline = new SlackGoogle(process.argv[2], {
		config: {
			path: process.argv[3],
			appRoot: __dirname,
		},
	});
	await Template().init()
	await pipeline.init();
	pipeline.app.get('/watch-send-code', pipeline.sendCode)
	pipeline.app.post('/watch-set-access-token', pipeline.getAccessToken)
})();
