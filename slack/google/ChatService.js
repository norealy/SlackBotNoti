const Env = require('../../utils/Env');
const Jwt = require('jsonwebtoken');
const Axios = require('axios');
const {newAccessToken} = require('./RefreshToken')
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const GoogleCalendar = require("../../models/GoogleCalendar");
const GoogleAccountCalendar = require("../../models/GoogleAccountCalendar");

/**
 * Cấu hình đường dẫn redirect login google
 * @param accessToken
 * @returns {string} url
 */
const configUrlAuth = (accessToken) => {
	let url = Env.resourceServerGOF('API_OAUTH');
	url += `?scope=${encodeURIComponent(Env.resourceServerGOF("SCOPE_CALENDAR"))}`;
	url += `+${Env.resourceServerGOF("SCOPE_USER_INFO")}`;
	url += `&access_type=${Env.resourceServerGOF("ACCESS_TYPE")}`;
	url += `&response_type=${Env.resourceServerGOF("RESPONSE_TYPE")}`;
	url += `&client_id=${Env.resourceServerGOF("CLIENT_ID")}`;
	url += `&redirect_uri=${Env.resourceServerGOF("REDIRECT_URI")}`;
	url += `&state=${accessToken}`;
	return url
};

/**
 * Thực hiện JWT để người dùng biết login từ channel và người gửi
 * @param {string} uid
 * @param  {string} channel
 * @returns{string} accessToken
 */
const createJwt = (uid, channel, idAccount) => {
	const header = {alg: Env.getOrFail("JWT_ALG"), typ: "JWT"};
	const payload = {idUser: uid, idChannel: channel, idAccount: idAccount};
	const iat = Math.floor(new Date());
	const exp = iat + Env.getOrFail("JWT_DURATION") / 1000;
	const key = Env.getOrFail("JWT_KEY");
	return Jwt.sign({header, payload, exp}, key)
};

/**
 *
 * @param token
 * @return {Promise<boolean>}
 */
const decode = async (token) => {
	const key = Env.getOrFail("JWT_KEY");
	const verified = await Jwt.verify(
		token,
		key
	)
	if (!verified) {
		return false
	}
	const decode = Jwt.decode(token);
	const data = decode.payload;
	return data;
}

/**
 * Thực thi việc requestLogin gửi về một Post Message
 * @param {object} event
 * @param {view} loginResource
 * @returns {Promise }
 */
const requestPostLogin = (event, loginResource) => {
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_URL');
	option.url += Env.chatServiceGOF('API_POST_MESSAGE');
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
	const {inviter, channel} = event;
	const accessToken = createJwt(inviter, channel);
	loginResource[2].elements[0].url = configUrlAuth(accessToken);
	option.data = {
		"channel": event.channel,
		"blocks": loginResource
	};

	return Axios(option);
}

/**
 * Trả về 1 View Settings
 * @param{object} body
 * @param {view} systemSetting
 * @returns {Promise}
 */
const requestSettings = (body, systemSetting) => {
	try {
		const option = {method: "POST"};
		option.url = Env.chatServiceGOF('API_URL');
		option.url += Env.chatServiceGOF('API_VIEW_OPEN');
		option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
		const {user_id, channel_id} = body;
		const {trigger_id} = body;
		const accessToken = createJwt(user_id, channel_id);
		systemSetting.blocks[3].elements[0].url = configUrlAuth(accessToken);
		option.data = {
			"trigger_id": trigger_id,
			"view": systemSetting,
		}
		return Axios(option);
	} catch (e) {
		return e
	}
}
/**
 * Thực hiện việc insert view home page
 * @param body
 * @param  {view} homePage
 * @returns {Promise}
 */
const requestHome = (body, homePage) => {
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_URL');
	option.url += Env.chatServiceGOF('API_VIEW_PUBLISH');
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
	const {user_id, trigger_id} = body;
	option.data = {
		"user_id": user_id,
		"trigger_id": trigger_id,
		"view": homePage,
	};
	return Axios(option);
};

const requestAddEvent = async (body, template) => {
	try {
		let addView = JSON.stringify(template)
		addView = JSON.parse(addView);
		let option = {method: "POST"}
		option.url = Env.chatServiceGOF('API_URL');
		option.url += Env.chatServiceGOF('API_VIEW_OPEN');
		option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`}
		const {trigger_id = null, channel_id = null} = body;
		option.data = {
			"trigger_id": trigger_id,
			"view": addView
		}
		const chanCals = await ChannelsCalendar.query().where({id_channel: channel_id});
		for (let i = 0; i < chanCals.length; i++) {
			const item = chanCals[i];
			const calendar = await GoogleCalendar.query().findById(item.id_calendar);
			//onsole.log(calendar);
			const selectCalendars = {
				"text": {
					"type": "plain_text",
					"text": calendar.name,
					"emoji": true
				},
				"value": calendar.id
			}
			option.data.view.blocks[1].accessory.options.push(selectCalendars);
		}
		const timePicker = customDatetime();
		option.data.view.blocks[6].accessory.options = timePicker;
		option.data.view.blocks[7].accessory.options = timePicker;
		option.data.view.blocks.splice(5, 1)
		const result = await Axios(option);
		return result
	} catch (e) {
		throw e
	}
}
/**
 *
 * @param payload
 * @param template
 * @returns {void|*|AxiosPromise}
 */
const handlerAddEvent = async (body, template, timePicker) => {
	const {trigger_id = null, channel_id = null} = body;
	const {addEvent} = template;
	let addView = JSON.stringify(addEvent);
	addView = JSON.parse(addView);
	const data = {
		trigger_id: trigger_id,
		view: addView,
	};
	const options = {
		method: "POST",
		headers: {Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`},
		data: data,
		url:
			Env.chatServiceGet("API_URL") +
			Env.chatServiceGet("API_VIEW_OPEN"),
	};
	const chanCals = await ChannelsCalendar.query().where({id_channel: channel_id});
	for (let i = 0; i < chanCals.length; i++) {
		const item = chanCals[i];
		const calendar = await MicrosoftCalendar.query().findById(item.id_calendar);
		const selectCalendars = {
			"text": {
				"type": "plain_text",
				"text": calendar.name,
				"emoji": true
			},
			"value": calendar.id
		}
		options.data.view.blocks[1].accessory.options.push(selectCalendars);
	}
	options.data.view.blocks[6].accessory.options = timePicker;
	options.data.view.blocks[7].accessory.options = timePicker;
	addView.blocks.splice(5, 1);
	return Axios(options);
};

const requestBlockActionsAllDay = async (payload, template) => {
	const {addEvent} = template;
	let addView = Object.assign({}, addEvent);
	addView.blocks = payload.view.blocks;
	const {action_id = null, selected_options = null} = payload.actions[0];
	if (action_id === "allday" && selected_options.length === 0) {
		addView.blocks.splice(5, 1);
		addView.blocks.splice(5, 0, addEvent.blocks[7]);
		addView.blocks.splice(5, 0, addEvent.blocks[6]);
	} else if (action_id === "allday" && selected_options.length > 0) {
		addView.blocks.splice(5, 2);
		addView.blocks.splice(5, 0, addEvent.blocks[5]);
	}

	let data = {
		"view_id": payload["container"]["view_id"],
		"view": addView
	}
	const options = {
		method: 'POST',
		headers: {'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`},
		data: data,
		url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_UPDATE")}`
	};
	return new Promise((resolve, reject) => {
		Axios(options).then((resp) => {
			return resolve(resp);
		}).catch((err) => {
			return reject(err);
		});
	});
};

/**
 *  khi người dùng thực hiện click vào button login google ở home view
 * @param  {object} payload
 * @param {view} systemSetting
 * @returns {Promise}
 */
const requestButtonSettings = (payload, systemSetting,) => {
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_URL');
	option.url += Env.chatServiceGOF('API_VIEW_OPEN');
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
	const {user, trigger_id} = payload;
	const accessToken = createJwt(user.id, user.name);
	option.data = {
		"trigger_id": trigger_id,
		"view": systemSetting
	};
	option.data.view.blocks[3].elements[0].url = configUrlAuth(accessToken);
	return Axios(option);
};

/**
 *
 * @param event
 * @param idCanlendar
 * @returns {Promise}
 */
const createEvent = async (event, idCanlendar) => {
	try {
		const googleAccountCalendar = await GoogleAccountCalendar.query().findOne({id_calendar: idCanlendar})

		const idAccount = googleAccountCalendar.id_account
		const option = {method: "POST"};
		option.url = `https://www.googleapis.com/calendar/v3/calendars/${idCanlendar}/events`
		option.headers = {'content-type': 'application/json', 'X-Google-AccountId': idAccount};
		option.data = event
		return Axios(option);
	} catch (e) {
		throw e
	}
}

function customDatetime() {
	try {
		let arrayDT = [];
		let i = 0;
		while (i < 24) {
			let j = 0
			for (j = 0; j < 46; j++) {

				let datetimePicker = {
					"text": {
						"type": "plain_text",
						"text": "",
						"emoji": true
					},
					"value": ""
				}
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
				datetimePicker.value = textH.slice(0, 5)
				arrayDT.push(datetimePicker);
				j += 14;
			}
			i++;
		}
		return arrayDT;
	} catch (error) {
		return error;
	}
}

module.exports = {
	requestPostLogin,
	requestSettings,
	requestHome,
	requestButtonSettings,
	decode,
	requestAddEvent,
	createEvent,
	requestBlockActionsAllDay
}
