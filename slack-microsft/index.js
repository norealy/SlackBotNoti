const BaseServer = require("../common/BaseServer");
const Axios = require("axios");
const Env = require("../utils/Env");
const { redirectMicrosoft } = require("./CreateUrlAuthor");
const viewsDesign = require("../views/ViewsDesign");
const Auth = require("./Auth");

class SlackMicrosoft extends BaseServer {
	constructor(instanceId, opt) {
    super(instanceId, opt);
    this.microsoftAccess = this.microsoftAccess.bind(this);
    this.authAccess = Auth.getAccessToken.bind(this);
    this.microsoftSendCode = this.microsoftSendCode.bind(this);
    this.authSendCode = Auth.sendCode.bind(this);
	}

	async chatServiceHandler(req, res, next) {
		const tokenBot = Env.chatServiceGet("TOKEN_BOT");
		console.log("======= chat Service Handler =======");
		console.log(req.body);
		let payload = req.body.payload;
		if (typeof payload !== "undefined") {
			payload = JSON.parse(payload);
		}

		if (!req.body.payload) {
			if (req.body.text.split(" ")[0] === "settings") {

        console.log(req.body)
				const data = {
					trigger_id: req.body.trigger_id,
					view: viewsDesign.addCalendarToChannel,
				};
				const options = {
					method: "POST",
					headers: { Authorization: `Bearer ${tokenBot}` },
					data: data,
					url: `https://slack.com/api/views.open`,
        };
        options.data.view.blocks[3].elements[1].url = redirectMicrosoft(
					req.body.channel,
					req.body.trigger_id.split('.')[0]
				);
				const result = await Axios(options);
				console.log(result.data);

				return res.status(202).send(`Thank you call BOT-NOTI !
			If you want assistance please enter: /cal --help`);
			}
		} else if (payload.type === "block_actions") {
			if (payload.actions[0].action_id === "addMicrosoft") {
				console.log("addMicrosoft");
			}
		}
		return res
			.status(200)
			.send("Watch request handler the Microsoft Outlook Calendar");
	}

	async resourceServerHandler(req, res, next) {
		try {
			const tokenBot = Env.chatServiceGet("TOKEN_BOT");
			console.log("======= resource Server Handler =======");
			console.log("USER_BOT", Env.chatServiceGet("USER_BOT"));
			const challenge = req.body.challenge;
			const event = req.body.event;
			if (challenge) {
				return res.status(200).send(challenge);
			} else if (
				event &&
				(event.subtype === "bot_add" ||
					(event.subtype === "channel_join" &&
						event.user === Env.chatServiceGet("USER_BOT")))
			) {
				const options = {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${tokenBot}`,
					},
					data: {
						channel: event.channel,
						blocks: viewsDesign.settingMessCal,
					},
					url: "https://slack.com/api/chat.postMessage",
				};
				options.data.blocks[3].elements[1].url = redirectMicrosoft(
					event.channel,
					req.body.event_id
				);
				const result = await Axios(options);
				// console.log("data", result.data);
			}
			return res.status(204).send("OK");
		} catch (e) {
			console.log(e);
			return res.status(204).send("ERROR");
		}
  }

  microsoftAccess(req,res,next){
    this.authAccess(req,res,next);
  }
  microsoftSendCode(req,res,next){
    this.authSendCode(req,res,next);
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
	pipeline.app.get("/auth/microsoft", pipeline.microsoftSendCode);
	pipeline.app.post("/auth/code", pipeline.microsoftAccess);
})();
