const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const Template = require("../views/Template");
const Channels = require("../../models/Channels");
const GoogleAccount = require("../../models/GoogleAccount");
const GoogleCalendar = require("../../models/GoogleCalendar");
const Redis = require('../../utils/redis');
const AxiosConfig = require('./Axios');
const Axios = require('axios');
const {cryptoDecode} = require('../../utils/Crypto');
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const GoogleAccountCalendar = require("../../models/GoogleAccountCalendar");
const Moment = require('moment');

const {
	getToken,
	getListCalendar,
	getProfile,
	getInfoChannel,
	saveInfoChannel,
	watchGoogleCalendar,
	getTimeZoneGoogle
} = require("./Auth");

const {
	requestPostLogin,
	requestSettings,
	requestHome,
	requestButtonSettings,
	decode,
	requestAddEvent,
	createEvent,
	deleteEvent,
	updateEvent,
	handarlerShowListEvent,
	requestBlockActionsAllDay,
	handlerDeleteEvent,
	handlerUpdateEvent
} = require("./ChatService");
const {
	getEventUpdate,
	sendWatchNoti
} = require("./ResourceServer");

class SlackGoogle extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.authGoogle = this.authGoogle.bind(this);
		this.template = Template();
		this.timePicker = customDatetime();
	}

	/**
	 *
	 * @param {object} event
	 * @returns {Promise}
	 */
	handlerEvent(event) {
		event = JSON.parse(JSON.stringify(event));
		const {subtype, user} = event;
		const botId = Env.chatServiceGOF("BOT_USER");
		const {loginResource} = this.template;
		const promise = new Promise((resolve) => resolve(event));
		const type = Env.chatServiceGOF("TYPE");
		switch (subtype) {
			case type.BOT_ADD:
				return requestPostLogin(event, loginResource);
			case type.APP_JOIN:
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
			return requestAddEvent(body, this.template.addEvent, this.timePicker);
		} else if (chat === "show-events") {
			return handarlerShowListEvent(body, this.template)
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
				return requestAddEvent(payload, this.template.addEvent, this.timePicker);
			} else if (payload.actions[0].action_id === "allday") {
				const options = requestBlockActionsAllDay(payload, this.template);
				await Axios(options);
			} else if (payload.actions[0].action_id === "overflow-action") {

				const value = payload.actions[0].selected_option.value.split('/');
				const blockId = payload.actions[0].block_id.split('/');

				if (value[0] === "edit") {

					console.log("edit")
					const title = payload.message.blocks[1].fields[0].text;
					const time = payload.message.blocks[1].fields[1].text;
					const location = payload.message.blocks[1].fields[2].text;
					const date = payload.message.blocks[1].fields[3].text


					return handlerUpdateEvent(payload, this.template.editEvent, this.timePicker);
				} else if (value[0] === "delete") {

					return handlerDeleteEvent(payload, this.template.deleteEvent)
				}
			}
		} else if (payload.type === "view_submission" && payload.view.callback_id === 'deleteEvent') {
			console.log("delete ne")
			const blockId = payload.view.blocks[0].block_id.split('/');
			const idEvent = blockId[1]

			const event = payload.view.blocks[1].block_id.split('/');
			const idAccount = event[0]
			return deleteEvent(idAccount,idEvent)
		} else if (payload.type === "view_submission" && payload.view.callback_id === 'addEvent') {
			console.log("oke")
			const idCalendar = payload.view.state.values["select_calendar"]["select_calendar"]["selected_option"].value;
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
						`RRULE:FREQ=${payload.view.state.values["select_everyday"]["static_select-action"]["selected_option"].value};`
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
				};
				if (payload.view.state.values["check_allday"]["allday"].selected_options.length === 0) {
					const dateTimeStart = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["select-time-start"]["time-start-action"]["selected_option"].value}:00+07:00`;
					const dateTimeEnd = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["select-time-end"]["time-end-action"]["selected_option"].value}:00+07:00`;
					event.start.dateTime = dateTimeStart;
					event.end.dateTime = dateTimeEnd;
				} else if (payload.view.state.values["check_allday"]["allday"].selected_options[0].value === 'true') {
					const dateAllDayStart = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}`;
					const dateAllDayEnd = `${payload.view.state.values["select-date-end"]["datepicker-action-end"]["selected_date"]}`;
					event.start.date = dateAllDayStart;
					event.end.date = dateAllDayEnd;
				}
				return createEvent(event, idCalendar)
			} catch (e) {
				return e
			}
		} else if (payload.type === "view_submission" && payload.view.callback_id === 'editEvent') {
			const value = payload.view.blocks[0].block_id.split('/')

			console.log("payload",payload.view.blocks)
			const idAccount = value[2]
			const idEvent = value[1];
			const idCalendar = payload.view.state.values["select_calendar"]["select_calendar"]["selected_option"].value;
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
					`RRULE:FREQ=${payload.view.state.values["select_everyday"]["static_select-action"]["selected_option"].value};`
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
			};
			if (payload.view.state.values["check_allday"]["allday"].selected_options.length === 0) {
				const dateTimeStart = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["select-time-start"]["time-start-action"]["selected_option"].value}:00+07:00`;
				const dateTimeEnd = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["select-time-end"]["time-end-action"]["selected_option"].value}:00+07:00`;
				event.start.dateTime = dateTimeStart;
				event.end.dateTime = dateTimeEnd;
			} else if (payload.view.state.values["check_allday"]["allday"].selected_options[0].value === 'true') {
				const dateAllDayStart = `${payload.view.state.values["select-date-start"]["datepicker-action-start"]["selected_date"]}`;
				const dateAllDayEnd = `${payload.view.state.values["select-date-end"]["datepicker-action-end"]["selected_date"]}`;
				event.start.date = dateAllDayStart;
				event.end.date = dateAllDayEnd;
			}
			console.log(idCalendar,idEvent,idAccount)
			return updateEvent(event, idCalendar, idEvent,idAccount)
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
				console.log("payload,",payload)
				await this.handlerPayLoad(req.body, payload);
				return res.status(200).send({"response_action": "clear"});
			}
		} catch (error) {
			console.log("err", error.response.data.error)
			return res.status(403).send("Error");
		}
	}

	/**
	 *
	 * @param {object} calendar
	 * @param {string} idAccount
	 * @return {Promise<object|boolean>}
	 */
	async handlerCalendars(calendar, idAccount) {
		const findCalendar = await GoogleCalendar.query().findOne({id: calendar.id});
		if (!findCalendar) await GoogleCalendar.query()
			.insert({id: calendar.id, name: calendar.summary});

		const googleAC = {
			id_calendar: calendar.id,
			id_account: idAccount,
		};
		const findGAC = await GoogleAccountCalendar.query().findOne(googleAC);
		if (!findGAC) return googleAC;
		return false
	}

	/**
	 *
	 * @param {object} profile
	 * @param {object} tokens
	 * @return {Promise<void>}
	 */
	async handlerUser(profile, tokens) {
		const result = await getTimeZoneGoogle(tokens.access_token);
		const timeZone = result.data.value;
		Redis.client.setex(`GOOGLE_ACCESS_TOKEN_` + profile.sub, 60 * 59, tokens.access_token);
		await GoogleAccount.query().insert({
			id: profile.sub,
			name: profile.name,
			refresh_token: tokens.refresh_token,
			timezone: timeZone,
		});
	}

	async authGoogle(req, res) {
		const {code, state} = req.query;
		try {
			const tokens = await getToken(code, state);

			// Xử lý profile user google
			const profile = await getProfile(tokens.access_token);
			const user = await GoogleAccount.query().findById(profile.sub);
			if (!user) await this.handlerUser(profile, tokens);

			// Xử lý channel slack
			const {idChannel} = await decode(state);
			let channel = await Channels.query().findById(idChannel);
			if (!channel) {
				channel = await getInfoChannel(idChannel);
				await saveInfoChannel(channel)
			}

			// Xử lý danh sách calendar
			const {items} = await getListCalendar(profile.sub, tokens.access_token);
			const channelCalendar = [];
			let accountCalendar = [];
			const regex = /writer|owner/;
			for (let i = 0, length = items.length; i < length; i++) {
				if (regex.test(items[i].accessRole)) {
					channelCalendar.push({
						id_calendar: items[i].id,
						id_channel: idChannel,
						watch: true,
					});

					const result = await this.handlerCalendars(items[i], profile.sub);
					if (result) {
						accountCalendar.push(result);
						await watchGoogleCalendar(result);
					}
				}
			}

			await GoogleAccountCalendar.transaction(async trx => {
				try {
					await trx.insert(accountCalendar).into(GoogleAccountCalendar.tableName)
						.onConflict(["id_calendar", "id_account"])
						.merge();
				} catch (e) {
					trx.rollback();
				}
			});

			await ChannelsCalendar.transaction(async trx => {
				try {
					await trx.insert(channelCalendar).into(ChannelsCalendar.tableName)
						.onConflict(["id_calendar", "id_channel"])
						.merge();
				} catch (e) {
					trx.rollback();
				}
			});

			return res.send("Oke");
		} catch (err) {
			return res.send("ERROR");
		}
	}

	async resourceServerHandler(req, res, next) {
		try {
			const decode = cryptoDecode(req.headers['x-goog-channel-token']);
			const {idAccount, idCalendar} = JSON.parse(decode);
			const event = await getEventUpdate(req.headers, idAccount);
			const account = await GoogleAccount.query().findById(idAccount);
			event.timezone = account.timezone;
			const arrChannelCalendar = await ChannelsCalendar.query().where({id_calendar: idCalendar, watch: true});
			await Promise.all(arrChannelCalendar.map(item => sendWatchNoti(item.id_channel, this.template.showEvent, event)));
			return res.status(204).send("OK");

		} catch (e) {
			return res.status(204).send("ERROR");
		}
	}
}

function customDatetime() {
	let arrayDT = [];
	let i = 0;
	while (i < 24) {
		let j = 0;
		for (j = 0; j < 46; j++) {
			let datetimePicker = {
				"text": {
					"type": "plain_text",
					"text": "",
					"emoji": true
				},
				"value": ""
			};
			let textH = "";
			let textM = "";
			if (j < 10) {
				textM = `0${j}`;
			} else {
				textM = `${j}`;
			}
			if (i < 10) {
				textH = `0${i}:` + textM + "AM";
			} else if (i < 12) {
				textH = `${i}:` + textM + "AM";
			} else {
				textH = `${i}:` + textM + "PM";
			}
			datetimePicker.text.text = textH;
			datetimePicker.value = textH.slice(0, 5);
			arrayDT.push(datetimePicker);
			j += 14;
		}
		i++;
	}
	return arrayDT;
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
