const BaseServer = require("../common/BaseServer");
const Env = require("../utils/Env");
const Template = require("./views/Template");
const auth = require("./Auth");
const {
	requestPostLogin,
	requestSettings,
	requestHome,
	requestButtonSettings,
} = require("./ChatService");

class SlackGoogle extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.getAccessToken = this.getAccessToken.bind(this);
		this.template = Template();
	}


	/**
	 *
	 * @param {object} event
	 * @returns {Promise}
	 */
	handlerEvent(event) {
		const { subtype, user } = event;
		const botId = Env.chatServiceGOF("USER_BOT");
		const { loginResource } = this.template;
		const promise = new Promise((resolve) => resolve(event));
		switch (subtype) {
			case Env.chatServiceGOF("BOT_ADD"):
				return requestPostLogin(event, loginResource);
			case Env.chatServiceGOF("APP_JOIN"):
			case Env.chatServiceGOF("CHANNEL_JOIN"):
				if (user === botId) return requestPostLogin(event, loginResource);
				return promise;
			default:
				return promise;
		}
	}

	/**
	 *
	 * @param {object} body
	 * @returns {Promise}
	 */
	 handlerBodyText(body) {
		const chat = body.text.trim();
		const promise = new Promise((resolve) => resolve());
		if (chat === "home") {
			return requestHome(body, this.template.homePage);
		} else if (chat === "settings") {
			return requestSettings(body, this.template.systemSetting);
		} else {
			return promise;
		}
	}

	/**
	 *
	 * @param {object} body
	 * @param {object} payload
	 * @returns {Promise}
	 */
	handlerPayLoad(body, payload) {
		payload = JSON.parse(payload);
		if (payload.type === "block_actions") {
			if (payload.actions[0].action_id === "btnSettings") {
				return requestButtonSettings(payload, this.template.systemSetting);
			}
		}
	}
	async chatServiceHandler(req, res, next) {
		let {
			challenge = null,
			event = null,
			payload = null,
			command = null,
		} = req.body;
		try {
			if (challenge) {
				return res.status(200).send(challenge);
			}
			if (event) {
				await this.handlerEvent(event);
				return res.status(200).send("OK");
			} else if (command && /^\/cal$/.test(command)) {
				await this.handlerBodyText(req.body);
				return res.status(200).send("OK");
			}
			if (payload) {
				await this.handlerPayLoad(req.body, payload);
				return res.status(200).send("OK");
			}
		} catch (error) {
			return res.status(403).send("Error");
		}
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
	await Template().init();
	await pipeline.init();
	pipeline.app.get("/watch-send-code", pipeline.getAccessToken);
})();
