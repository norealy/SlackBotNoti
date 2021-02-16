const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const Template = require("../views/Template");
const { decodeJWS } = require("./Jws");

const {
	getToken,
	getListCalendar,
	getProfileUser,
	saveUserProfile,
	saveListCalendar,
	saveInfoChannel,
	saveMicrosoftAccountCalendar,
	saveChannelsCalendar,
} = require("./Auth");
const {
	sendMessageLogin,
	handlerSettingsMessage,
} = require("./HandlerChatService");

class SlackMicrosoft extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.microsoftAccess = this.microsoftAccess.bind(this);
		this.template = Template();
	}
	/**
	 * Xu ly cac event
	 * @param {object} event
	 * @param {string} tokenBot
	 * @returns {Promise}
	 */
	handlerEvent(event, tokenBot) {
		const { subtype, user } = event;
		const { loginResource } = this.template;
		const type = Env.chatServiceGOF("TYPE")
		if (
			subtype === type.BOT_ADD ||
			(subtype === type.CHANNEL_JOIN && user === Env.chatServiceGOF("BOT_USER"))
		)
			return sendMessageLogin(event, loginResource, tokenBot);
	}
	/**
	 *  Xu ly cac su kien nguoi dung goi lenh xu ly bot
	 * @param {object} body
	 * @param {string} tokenBot
	 * @returns {Promise}
	 */
	handlerCommand(body, tokenBot) {
		let text = body.text.trim();
		const { systemSetting } = this.template;
		const result = new Promise((resolve) => resolve(body));
		switch (text) {
			case "settings":
				return handlerSettingsMessage(systemSetting, body, tokenBot);
			default:
				return result;
		}
	}

	async chatServiceHandler(req, res, next) {
		let {
			payload = null,
			challenge = null,
			event = null,
			command = null,
		} = req.body;
		try {
			const tokenBot = Env.chatServiceGet("BOT_TOKEN");

			if (event) {
        await this.handlerEvent(event, tokenBot);

			} else if (command && /^\/cal$/.test(command)) {
        await this.handlerCommand(req.body, tokenBot);

			} else if (challenge) {
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
			return res.status(204).send("OK");
		} catch (e) {
			return res.status(204).send("ERROR");
		}
	}

	async microsoftAccess(req, res, next) {
		const { code, state } = req.query;
		try {
			const tokens = await getToken(code, state);
			const accessTokenAzure = tokens.access_token;
			const refreshTokenAzure = tokens.refresh_token;

			// Thuc hien lay tai nguyen list calendars
			const allData = await getListCalendar(accessTokenAzure);
			const allCalendar = allData.value;

			// Thuc hien lay tai nguyen user profile
			const profileUser = await getProfileUser(accessTokenAzure);

			// Thêm đối tượng microsoftAccount và bảng microsoft_account
			await saveUserProfile(profileUser, refreshTokenAzure);

			// Thêm list calendar vào bảng microsoft_calendar
			await saveListCalendar(allCalendar);

			// Luu  vào bảng microsoft_account_calendar
			await saveMicrosoftAccountCalendar(profileUser.id, allCalendar);

			// Lay Decode jwt de lay ra data
			const { idChannel, idUser } = await decodeJWS(state);

			// Thêm channelvào bảng channels
			await saveInfoChannel(idChannel);

			//  Luu channels calendar vào bảng channels_calendar
			await saveChannelsCalendar(idChannel, allCalendar);

			return res.send("Successful !");
		} catch (e) {
			return res.send("Login Error !");
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
	await Template().init();
	await pipeline.init();
	pipeline.app.get("/auth/microsoft", pipeline.microsoftAccess);
})();
