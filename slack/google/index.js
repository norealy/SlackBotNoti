const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const Template = require("../views/Template");
const Channels = require("../../models/Channels");
const GoogleAccount = require("../../models/GoogleAccount");
const Redis = require('../../utils/redis')
const AxiosConfig = require('./Axios');
const Axios = require('axios')
const ChannelsCalendar = require("../../models/ChannelsCalendar")
const {
	getToken,
	getListCalendar,
	getProfile,
	getInfoChannel,
	saveUserProfile,
	saveInfoChannel,
	saveListCalendar,
	SaveGoogleAccountCalendar,
	SaveChannelsCalendar
} = require("./Auth");

const {
	requestPostLogin,
	requestSettings,
	requestHome,
	requestButtonSettings,
	decode,
	requestAddEvent,
	createEvent,
	requestBlockActionsAllDay
} = require("./ChatService");
 const {
	 getEventUpdate,
	 sendWatchNoti
 } = require("./ResourceServer")
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
		console.log(event)
		event = JSON.parse(JSON.stringify(event))
		const {subtype, user} = event;
		const botId = Env.chatServiceGOF("BOT_USER");
		const {loginResource} = this.template;
		const promise = new Promise((resolve) => resolve(event));
		const type = Env.chatServiceGOF("TYPE");
		switch (subtype) {
			case type.BOT_ADD:
				return requestPostLogin(event, loginResource);
			//case type.APP_JOIM:
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
		} else if (chat === "add-event") {
			return requestAddEvent(body, this.template.addEvent);
		} else {
			return promise;
		}
	}

	/**
	 *
	 * @param {object} body
	 * @param {object} payload
	 * @param {string} accessToken
	 * @returns {Promise}
	 */
	async handlerPayLoad(body, payload) {
		payload = JSON.parse(payload);
		if (payload.type === "block_actions") {
			if (payload.actions[0].action_id === "btnSettings") {
				return requestButtonSettings(payload, this.template.systemSetting);
			} else if (payload.actions[0].action_id === "btnEventAdd") {
				return requestAddEvent(payload, this.template.addEvent);
			} else if (payload.actions[0].action_id === "allday") {
				requestBlockActionsAllDay(payload, this.template)
			}
		} else if (payload.type === "view_submission") {
			const idCalendar = payload.view.state.values["select_calendar"]["select_calendar"]["selected_option"].value
			try {
				let event = {
					"summary": payload.view.state.values["input_title"]["input-action"].value,
					"location": payload.view.state.values["input_location"]["plain_text_input-action"].value,

					"start": {
						"timeZone": "Asia/Ho_Chi_Minh"
					},
					"end": {
						"timeZone": "Asia/Ho_Chi_Minh"
					},
					"recurrence": [
						`RRULE:FREQ=${payload.view.state.values["select_everyday"]["static_select-action"]["selected_option"].value};COUNT=2`
					],
					"reminders": {
						"useDefault": false,
						"overrides": [
							{
								"method": "email",
								"minutes": parseInt(payload.view.state.values["select_before_notification"]["static_select-action"]["selected_option"].value),
							},
							{
								"method": "popup",
								"minutes": parseInt(payload.view.state.values["select_before_notification"]["static_select-action"]["selected_option"].value),
							}
						]
					}
				}
				if (payload.view.state.values["check_allday"]["allday"].selected_options.length === 0) {
					const dateTimeStart = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["select-time-start"]["time-start-action"]["selected_option"].value}:00+07:00`;
					const dateTimeEnd = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["select-time-end"]["time-end-action"]["selected_option"].value}:00+07:00`;
					event.start.dateTime = dateTimeStart;
					event.end.dateTime = dateTimeEnd;

				} else if (payload.view.state.values["check_allday"]["allday"].selected_options[0].value === 'true') {
					const dateAllDayStart = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}`
					const dateAllDayEnd = `${payload.view.state.values["select-date-end"]["datepicker-action-end"]["selected_date"]}`
					event.start.date = dateAllDayStart;
					event.end.date = dateAllDayEnd;

				}
				return createEvent(event, idCalendar)
			} catch (e) {
				console.log("err",e)
				throw e
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
				return res.status(200).send({"response_action": "clear"});
			}
		} catch (error) {
			console.log("errr",error)
			return res.status(403).send("Error");
		}
	}

	async authGoogle(req, res) {
		const {code, state} = req.query;
		try {
			const tokens = await getToken(code, state);
			const accessTokenGoogle = tokens.access_token;
			const refreshTokenGoogle = tokens.refresh_token;

			// Xử lý profile user google
			const profileUser = await getProfile(accessTokenGoogle);
			const user = await GoogleAccount.query().findById(profileUser.sub);
			if (!user) {
				await saveUserProfile(profileUser, refreshTokenGoogle, accessTokenGoogle);
			}
			// Xử lý danh sách calendar
			const calendars = await getListCalendar(profileUser.sub);
			const listCalendar = calendars.items;
			await saveListCalendar(listCalendar);

			// Xử lý channel slack
			const {idChannel, idUser} = await decode(state);
			let channel = await Channels.query().findById(idChannel);
			if (!channel) {
				channel = await getInfoChannel(idChannel);
				await saveInfoChannel(channel.channel)
			}

			// xử lí mảng để lưu
			let idCalendars = [];
			for (let calendar of listCalendar) {
				idCalendars.push(calendar.id)
			}

			// profileUser +  listAllCalendar
			await SaveGoogleAccountCalendar(idCalendars, profileUser.sub);
			await SaveChannelsCalendar(idCalendars, idChannel);

			return res.send("Oke");
		} catch (err) {
			console.log("err",err.response.data)
			return res.send("ERROR");
		}
	}
	 getValueRedis(key) {
		return new Promise((resolve, reject) => {
			Redis.client.get(key, (err, reply) => {
				if (err) reject(null);
				resolve(reply);
			});
		})
	}
	async resourceServerHandler(req, res, next) {
		try {
			const event = await getEventUpdate(req.headers,"106346810760142562802");
			//console.log(event);
			console.log("headers",req.headers)
			//const arrIdChannel = await ChannelsCalendar.query().where({ id_calendar: idCal , watch : true });
			const options = await sendWatchNoti("C01P0CCHQV9",this.template.showEvent,event)

			return res.status(204).send("OK");
		} catch (e) {
			console.log("err", e);
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
	AxiosConfig();
})();
