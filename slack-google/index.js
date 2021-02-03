const BaseServer = require('../common/BaseServer');
const Axios = require('axios');
const jwt = require('jsonwebtoken');
const qs = require('qs');
const Env = require('../utils/Env');
const viewsDesign = require('../views/ViewsDesign');
const TOKEN_BOT = Env.get("TOKEN_BOT")
const stateSecretSlack = Env.get("STATE", 'RANDOMID@@--123');
const stateSlack = Buffer.from(stateSecretSlack).toString('base64')
const redirectUrlGoogle = Env.get("REDIRECT_URI", "http://localhost:5000/watch-send-code");
const GOOGLE_CLIENT_ID = Env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Env.get("GOOGLE_CLIENT_SECRET");

class SlackGoogle extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
	}
	async chatServiceHandler(req, res, next) {
		const {challenge = null, event = null} = req.body
		try {
			let body = "";
			const challenge = req.body.challenge;
			if (challenge) {
				//console.log(challenge);
				return res.status(200).send(challenge);
			}
			else if (event && (event.subtype === 'bot_add' ||(event.subtype === 'channel_join' && event.user===Env.chatServiceGet("USER_BOT")))) {
			const option = {
				method:"POST",
				headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
				data:{
					"channel":event.channel,
					"blocks": viewsDesign.loginGoogle
				},
				url: `https://slack.com/api/chat.postMessage`
			}
			const done = await Axios(option);
			console.log(done.data);
		return res.status(200).send("done");
		}
			let payload = req.body.payload;
			let viewsAdd = Object.assign({}, viewsDesign.addEvent);
			if (typeof payload !== 'undefined') {
				payload = JSON.parse(payload);
			}
			if (!req.body.payload) {
				if (req.body.text.split(" ")[0] === "home") {
					const data = {
						"user_id": "U01JW789NJ2",
						"trigger_id": req.body.trigger_id,
						"view": viewsDesign.homeApp
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
						data: data,
						url: "https://slack.com/api/views.publish"
					};
					const result = await Axios(options);
					console.log(result);
					return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter: /cal --help`);
				}
				else if (req.body.text.split(" ")[0] === "settings") {
					const data = {
						"trigger_id": req.body.trigger_id,
						"view": viewsDesign.addCalendarToChannel
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
						data: data,
						url: `https://slack.com/api/views.open`
					};
					const result = await Axios(options);
					console.log(result)
					return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter: /cal --help`);
				}
				else if (req.body.text.split(" ")[0] === "add-event") {
					viewsAdd.blocks.splice(5, 0, viewsDesign.timeEnd);
					viewsAdd.blocks.splice(5, 0, viewsDesign.timeStart);

					const data = {
						"trigger_id": req.body.trigger_id,
						"view": viewsAdd
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
						data: data,
						url: `https://slack.com/api/views.open`
					};
					const result = await Axios(options);
					//  console.log(result.data)
					return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter: /cal --help`);
				}
				else if (req.body.text.split(" ")[0] === "all") {
					console.log(req.body);
					const data = {
						"channel": req.body.channel_id,
						"blocks": viewsDesign.listCalendar
					}

					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
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
						console.log("all day true")
						viewsAdd.blocks.splice(5, 2);
						viewsAdd.blocks.splice(5, 0, viewsDesign.dateEnd);
					} else if (payload.actions[0].selected_options.length === 0) {
						console.log("all day false")
						viewsAdd.blocks.splice(5, 1);

						viewsAdd.blocks.splice(5, 0, viewsDesign.timeEnd);
						viewsAdd.blocks.splice(5, 0, viewsDesign.timeStart);
					}
					data = {
						"view_id": payload["container"]["view_id"],
						"view": viewsAdd
					}

				} else if (payload.actions[0].action_id === "buttonSubmit") {
					console.log(payload)
					data = {
						"trigger_id": req.body.trigger_id,
						"channel": payload.channel.id,
						"blocks": viewsDesign.listEvent
					}
					url = `https://slack.com/api/chat.postMessage`;
				} else if (payload.actions[0].action_id === "buttonDelete") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": viewsDesign.deleteEvent
					}
					url = `https://slack.com/api/views.push`;
				} else if (payload.actions[0].action_id === "buttonUpdate") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": viewsDesign.editEvent
					}
					url = `https://slack.com/api/views.open`;
				} else if (payload.actions[0].action_id === 'deleteOK') {
					console.log(payload)
					url = `https://slack.com/api/views.open`;
					data = {
						"view_id": payload["container"]["view_id"],
						"view": payload.view
					}
				}
				// code Home
				else if (payload.actions[0].action_id === "btnToday") {
					console.log(payload);
					data = {
						"trigger_id": req.body.trigger_id,
						"channel": payload.channel.id,
						"blocks": viewsDesign.listEvent
					}
					url = `https://slack.com/api/chat.postMessage`;
				} else if (payload.actions[0].action_id === "btnTomorrow") {
					data = {
						"trigger_id": req.body.trigger_id,
						"channel": payload.channel.id,
						"blocks": viewsDesign.listEvent
					}
					url = `https://slack.com/api/chat.postMessage`;
				} else if (payload.actions[0].action_id === "btnEventAdd") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": viewsDesign.addEvent
					}
					url = `https://slack.com/api/views.open`;
				} else if (payload.actions[0].action_id === "btnSettings") {
					data = {
						"trigger_id": payload.trigger_id,
						"view": viewsDesign.addCalendarToChannel
					}
					url = `https://slack.com/api/views.open`;
				} else if (payload.actions[0].action_id === "overflow-action") {
					console.log(payload.actions[0].selected_option);
					if (payload.actions[0].selected_option.value === 'value-1') {
						data = {
							"trigger_id": payload.trigger_id,
							"view": viewsDesign.deleteEvent
						}
						url = `https://slack.com/api/views.open`;
					} else {
						data = {
							"trigger_id": payload.trigger_id,
							"view": viewsDesign.viewEvent,
						}
						url = `https://slack.com/api/views.open`;
					}
				}
				const options = {
					method: 'POST',
					"user_id": req.body.user_id,
					//"user_id":"U01JK8PAJ4X",
					headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
					data: data,
					url: url
				};
				const result = await Axios(options);
				console.log(result.data)
				return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter:  /cal --help`);
			} else if (payload.type === 'view_submission') {
				console.log("view_submission close !")
				const data = {
					"trigger_id": req.trigger_id,
					"view": payload.view
				}
				const options = {
					method: 'POST',
					headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
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

	resourceServerHandler(req, res, next) {
		try {
			return res.status(204).send("OK");
		} catch (e) {
			return res.status(204).send("ERROR");
		}
	}
	// xử lí loogle google
	async sendCode(req, res, next) {
		const code = req.query.code;
		console.log("Code :", code)
		const uri = "http://localhost:5000/watch-set-access-token";
		const data = {
			code: code
		}
		const options = {
			method: 'POST',
			headers: {'content-type': 'application/json'},
			data: JSON.stringify(data),
			url: uri,
		};
		try {
			await Axios(options);
			return res.status(200).send('oke');
		} catch (err) {
			//console.log(err);
			return res.status(403).send("Error");
		}
	}
	async setAccessToken(req, res, next) {
		try {
			const code  = req.body.code
			const urlGetToken = "https://oauth2.googleapis.com/token";
			let data1 = {
				client_id: GOOGLE_CLIENT_ID,
				client_secret: GOOGLE_CLIENT_SECRET,
				code: code,
				grant_type: "authorization_code",
				redirect_uri: redirectUrlGoogle,
			};
			const options = {
				method: 'POST',
				headers: {'content-type': 'application/x-www-form-urlencoded'},
				data: qs.stringify(data1),
				url: urlGetToken,
			};
			const result = await Axios(options);
			console.log(result.data);
			const accessTokenGoogle = result.data.access_token;
			console.log(accessTokenGoogle)
			return res.status(200).send("OK");
			//return res.status(200).send("Post Code ok");
		} catch (error) {
			console.log(error)
			return res.status(403).send(error);
		}
	}
	async getListCalendar (req,res,next){
		try {
			const accessToken  = req.header('x-auth-token');
			const options = {
				method:"GET",
				headers: {'Authorization': `Bearer ${accessToken}` },
				url:'https://www.googleapis.com/calendar/v3/users/me/calendarList',
			}
			const result = await Axios(options);
			return res.status(200).send(result.data);
		}
		catch (error) {
			console.log(error)
			return res.status(403).send(error);
		}
}
async getInfo(req,res,next){
	try {
		const accessToken  = req.header('x-auth-token');
		const options = {
			method:"GET",
			headers: {'Authorization': `Bearer ${accessToken}` },
			url: "https://www.googleapis.com/oauth2/v3/userinfo",
		}
		const result = await Axios(options);
		return res.status(200).send(result.data);
	}
	catch (error) {
		console.log(error)
		return res.status(403).send(error);
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
	await pipeline.init();
})();
