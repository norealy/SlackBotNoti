const BaseServer = require("../common/BaseServer");
const Env = require("../utils/Env");
const Template = require("./views/Template");
const Auth = require("./Auth");
const { sendMessageLogin,handlerSettingsMessage } = require("./HandlerChatService");
class SlackMicrosoft extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.microsoftAccess = this.microsoftAccess.bind(this);
		this.authAccess = Auth.getAccessToken.bind(this);
		this.template = Template();
	}
/**
 *
 * @param {*} event
 * @param {*} tokenBot
 */
	handlerEvent(event, tokenBot) {
		const {subtype, user} = event;
		const {loginResource} = this.template
		if((subtype === "bot_add" ||
			(subtype === "channel_join" && user === Env.chatServiceGOF("USER_BOT"))))
			return sendMessageLogin(event, loginResource, tokenBot);

	}
/**
 *
 * @param {*} payload
 */
	handlerPayload(payload) {
		payload = JSON.parse(payload);
		if (payload.type === "block_actions") {
			if (payload.actions[0].action_id === "addMicrosoft") {
				console.log("addMicrosoft");
			}
		}
	}
/**
 *
 * @param {*} body
 * @param {*} tokenBot
 */
	handlerCommand(body, tokenBot) {
		let text = body.text.trim()
		const {systemSetting} = this.template
		const result = new Promise(resolve => resolve(body))
		switch (text){
			case "settings":
				return handlerSettingsMessage(systemSetting, body, tokenBot);
			default:
				return result
		}
	}

	async chatServiceHandler(req, res, next) {
    console.log("======= chat Service Handler =======");
		let {payload=null, challenge=null, event=null, command=null} = req.body
		try {
			const tokenBot = Env.chatServiceGet("TOKEN_BOT");

			if (event){
				await this.handlerEvent(event, tokenBot)
			}

			else if (payload) {
				this.handlerPayload(payload);
			}

			else if(command && /^\/cal$/.test(command)){
				await this.handlerCommand(req.body, tokenBot)
			}

			else if (challenge) {
				return res.status(200).send(challenge);
			}

			const message = `Thank you call BOT-NOTI !`;
			return res.status(200).send(message);
		} catch (error) {
      const message = `Thank you call BOT-NOTI !
        If you want assistance please enter: /cal --help`;
			return res.status(403).send(message);
    }
	}

	async resourceServerHandler(req, res, next) {
		try {
      console.log("======= resource Server Handler =======");
			const tokenBot = Env.chatServiceGet("TOKEN_BOT");

		} catch (e) {
			console.log(e);
			return res.status(204).send("ERROR");
		}
	}

	microsoftAccess(req, res, next) {
		this.authAccess(req, res, next);
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
	await Template().init();
	await pipeline.init();
	pipeline.app.get("/auth/microsoft", pipeline.microsoftAccess);
})();
