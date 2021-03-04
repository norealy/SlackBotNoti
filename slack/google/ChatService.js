const Env = require('../../utils/Env');
const Axios = require('axios');
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const GoogleCalendar = require("../../models/GoogleCalendar");
const GoogleAccountCalendar = require("../../models/GoogleAccountCalendar");
const {createJWT} = require('../../utils/Crypto');
const {v4: uuidv4} = require('uuid');

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
 * Thực thi việc requestLogin gửi về một Post Message
 * @param {object} event
 * @param {object} template
 * @param {function} setUidToken
 * @returns {object}
 */
const requestPostLogin = (event, template, setUidToken) => {
  const blocks = [...template.loginResource];
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_URL');
	option.url += Env.chatServiceGOF('API_POST_MESSAGE');
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
	const {inviter, channel} = event;
  const iat = Math.floor(new Date() / 1000);
  const uid = uuidv4();
  const payload = {
    uid,
    idUser: inviter,
    idChannel: channel,
    iat,
    exp: iat + parseInt(Env.getOrFail("JWT_DURATION"))
  };
  setUidToken(uid);
  const accessToken = createJWT(payload);
  blocks[2].elements[0].url = configUrlAuth(accessToken);
	option.data = {
		"channel": event.channel,
    blocks
	};
	return option
};

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
    const iat = Math.floor(new Date() / 1000);
    const payload = {
      idUser: user_id,
      idChannel: channel_id,
      iat,
      exp: iat + parseInt(Env.getOrFail("JWT_DURATION"))
    };
    const accessToken = createJWT(payload);
		systemSetting.blocks[3].elements[0].url = configUrlAuth(accessToken);
		option.data = {
			"trigger_id": trigger_id,
			"view": systemSetting,
		};
		return Axios(option);
	} catch (e) {
		return e
	}
};
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
		let addView = JSON.stringify(template);
		addView = JSON.parse(addView);
		let option = {method: "POST"};
		option.url = Env.chatServiceGOF('API_URL');
		option.url += Env.chatServiceGOF('API_VIEW_OPEN');
		option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
		const {trigger_id = null, channel_id = null} = body;
		option.data = {
			"trigger_id": trigger_id,
			"view": addView
		};
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
			};
			option.data.view.blocks[1].accessory.options.push(selectCalendars);
		}
		option.data.view.blocks.splice(5, 1);
		const result = await Axios(option);
		return result
	} catch (e) {
		throw e
	}
};

const requestBlockActionsAllDay = (payload, template) => {
	let view = {...template.addEvent};
	view.blocks = payload.view.blocks;
	const {action_id = null, selected_options = null} = payload.actions[0];
	if (action_id === "allDay" && selected_options.length === 0) {
		view.blocks.splice(5, 1);
		view.blocks.splice(5, 0, template.addEvent.blocks[7]);
		view.blocks.splice(5, 0, template.addEvent.blocks[6]);
	} else if (action_id === "allDay" && selected_options.length > 0) {
		view.blocks.splice(5, 2);
		view.blocks.splice(5, 0, template.addEvent.blocks[5]);
	}

	let data = {
		"view_id": payload["container"]["view_id"],
		"view": view
	};
	const options = {
		method: 'POST',
		headers: {'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`},
		data: data,
		url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_UPDATE")}`
	};
	return options
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
  const iat = Math.floor(new Date() / 1000);
  const data = {
    idUser: user.id,
    idChannel:  user.name,
    iat,
    exp: iat + parseInt(Env.getOrFail("JWT_DURATION"))
  };
  const accessToken = createJWT(data);
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
		const googleAccountCalendar = await GoogleAccountCalendar.query().findOne({id_calendar: idCanlendar});

		const idAccount = googleAccountCalendar.id_account;
		const option = {method: "POST"};
		option.url = `https://www.googleapis.com/calendar/v3/calendars/${idCanlendar}/events`;
		option.headers = {'content-type': 'application/json', 'X-Google-AccountId': idAccount};
		option.data = event;
		return Axios(option);
	} catch (e) {
		throw e
	}
};



module.exports = {
	requestPostLogin,
	requestSettings,
	requestHome,
	requestButtonSettings,
	requestAddEvent,
	createEvent,
	requestBlockActionsAllDay
};
