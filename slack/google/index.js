const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const Template = require("../views/Template");
const Channels = require("../../models/Channels");
const GoogleAccount = require("../../models/GoogleAccount");
const Axios = require('axios');
const AxiosConfig = require('./AxiosConfig');

const {
	getToken,
	getListCalendar,
	getProfile,
	getInfoChannel,
	saveUserProfile,
	saveInfoChannel,
	saveListCalendar,
	SaveGoogleAccountCalendar,
	SaveChannelsCalendar,
} = require("./Auth");

const {
	requestPostLogin,
	requestSettings,
	requestHome,
	requestButtonSettings,
	decode,
} = require("./ChatService");

class SlackGoogle extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.authGoogle = this.authGoogle.bind(this);
		this.template = Template();
	}


	/**
	 *
	 * @param {object} event
	 * @returns {Promise}
	 */
	handlerEvent(event) {
		const { subtype, user } = event;
		const botId = Env.chatServiceGOF("BOT_USER");
		const { loginResource } = this.template;
		const promise = new Promise((resolve) => resolve(event));
		const type = Env.chatServiceGOF("TYPE");
		switch (subtype) {
			case type.BOT_ADD:
				return requestPostLogin(event, loginResource);
			case type.APP_JOIM:
			case type.CHANNEL_JOIN:
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

	async authGoogle(req, res) {
		const { code, state } = req.query;
		try {
			const tokens = await getToken(code, state);
			const accessTokenGoogle = tokens.access_token;
			const refreshTokenGoogle = tokens.refresh_token;

			// Xử lý profile user google
			const profileUser = await getProfile(accessTokenGoogle);
			const user = await GoogleAccount.query().findById(profileUser.sub);
			if(!user){
				await saveUserProfile(profileUser, refreshTokenGoogle);
			}

			// Xử lý danh sách calendar
			const calendars = await getListCalendar(accessTokenGoogle);
			const listCalendar = calendars.items;
			await saveListCalendar(listCalendar);

			// Xử lý channel slack
			const {idChannel, idUser} = await decode(state);
			let channel = await Channels.query().findById(idChannel);
			if(!channel){
				channel = await getInfoChannel(idChannel);
				await saveInfoChannel(channel.channel)
			}

			// xử lí mảng để lưu
			let idCalendars = [];
			for (let calendar of listCalendar){
				idCalendars.push(calendar.id )
			}

			// profileUser +  listAllCalendar
			await SaveGoogleAccountCalendar(idCalendars, profileUser.sub);
			await SaveChannelsCalendar(idCalendars, idChannel);

			return res.send("Oke");
		} catch (err) {
			return res.send("ERROR");
		}
	}

	/**
	 * Get google calendar event updates
	 * @param {object} headers
	 * @return {Promise}
	 */
	getEventUpdate(headers) {
		return new Promise((resolve, reject) => {
			const dateNow = new Date();
			const options = {
				url: headers['x-goog-resource-uri'],
				method: 'GET',
				headers: {'Authorization': `Bearer ${Env.resourceServerGOF("ACCESS_TOKEN")}`},
				params: {
					updatedMin: new Date(dateNow - (5*60*1000)).toISOString(),
				},
			};
			Axios(options)
				.then(result => {
					const {items = []} = result.data;
					const legItem = items.length;
					if(legItem === 0) resolve(null);
					resolve(items[legItem - 1])
				})
				.catch(err => {
					reject(err)
				});
		});
	}

	async resourceServerHandler(req, res, next) {
		try {
			const item = await this.getEventUpdate(req.headers);
			console.log(item);
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
	pipeline.app.get("/auth/google", pipeline.authGoogle);
})();
