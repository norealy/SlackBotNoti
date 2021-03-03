const Env = require('../../utils/Env');
const Jwt = require('jsonwebtoken');
const Axios = require('axios');
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
	);
	if (!verified) {
		return false
	}
	const decode = Jwt.decode(token);
	const data = decode.payload;
	return data;
};

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
		const accessToken = createJwt(user_id, channel_id);
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

const requestAddEvent = async (body, template, timePicker) => {
	try {
		template.blocks[6].accessory.options = timePicker;
		template.blocks[7].accessory.options = timePicker;
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
	if (action_id === "allday" && selected_options.length === 0) {
		view.blocks.splice(5, 1);
		view.blocks.splice(5, 0, template.addEvent.blocks[7]);
		view.blocks.splice(5, 0, template.addEvent.blocks[6]);
	} else if (action_id === "allday" && selected_options.length > 0) {
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
	const accessToken = createJwt(user.id, user.name);
	option.data = {
		"trigger_id": trigger_id,
		"view": systemSetting
	};
	option.data.view.blocks[3].elements[0].url = configUrlAuth(accessToken);
	return Axios(option);
};
const handarlerShowListEvent = async (body,template) =>{
	console.log("oke",)
	const { channel_id = null } = body;
	const blocksView = [...template.listEvent.blocks];
	const idChannel = await ChannelsCalendar.query().where({ id_channel: channel_id });
	const idCalendars = await GoogleAccountCalendar.query().where({ id_calendar: idChannel[0].id_calendar });
	const idAccount = idCalendars[0].id_account;
	//const idCalendar = idChannel[0].id_calendar;
	const options = {
		method: 'GET',
		headers: { 'X-Google-AccountId': idAccount },
		url: `https://www.googleapis.com/calendar/v3/calendars/primary/events`
	}
	const events = await Axios(options);
	if (!events) return;
	const event = events.data.items[0];
		blocksView[1].block_id = `${idAccount}/${idCalendars[0].id_calendar}`;
		blocksView[1].accessory.options[0].value = `edit/${event.id}`;
		blocksView[1].accessory.options[1].value = `delete/${event.id}`;
		blocksView[1].fields[0].text = event.summary;
		blocksView[1].fields[3].text = event.start.dateTime.split('T')[0];
	const options1 = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`,
		},
		data: {
			channel: channel_id,
			blocks: blocksView,
		},
		url:
			Env.chatServiceGet("API_URL") +
			Env.chatServiceGet("API_POST_MESSAGE"),
	};
	return Axios(options1)
}
const handlerUpdateEvent = async (payload,template,timePicker) =>{
	template.blocks[6].accessory.options = timePicker;
	template.blocks[7].accessory.options = timePicker;
	let editEvent = JSON.stringify(template);
	editEvent = JSON.parse(editEvent);
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_URL');
	option.url += Env.chatServiceGOF('API_VIEW_OPEN');
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
	const {trigger_id = null, channel = null} = payload;
	option.data = {
		"trigger_id": trigger_id,
		"view": editEvent
	};
	const chanCals = await ChannelsCalendar.query().where({id_channel: channel.id});
	for (let i = 0; i < chanCals.length; i++) {
		const item = chanCals[i];
		const calendar = await GoogleCalendar.query().findById(item.id_calendar);
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
	option.data.view.blocks[0].block_id =payload.actions[0].selected_option.value
	option.data.view.blocks[0].block_id += '/'+`${payload.actions[0].block_id}`
	option.data.view.blocks[6].accessory.options = timePicker;
	option.data.view.blocks[7].accessory.options = timePicker;
	option.data.view.blocks.splice(5, 1);
	return  Axios(option)

}
const handlerDeleteEvent = async (payload,deteleEvent)=>{
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_URL');
	option.url += Env.chatServiceGOF('API_VIEW_OPEN');
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
	const {trigger_id} = payload;
	option.data = {
		"trigger_id": trigger_id,
		"view": deteleEvent
	};
	const blockId = payload.actions[0].block_id.split('/')
	option.data.view.blocks[0].text.text += payload.message.blocks[1].fields[0].text
	option.data.view.blocks[0].block_id = payload.actions[0]["selected_option"].value
	option.data.view.blocks[1].block_id = payload.actions[0].block_id;
	option.data.view.blocks[1].text.text += blockId[1]
	const test = await Axios(option);
	console.log("e",test.data.view.blocks)
	return test
}
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
/**
 *
 * @param event
 * @param idCalendar
 * @param idEvent
 * @returns {Promise}
 */
const deleteEvent = async (idAccount,idEvent)=>{
	try {
		const option = {method: "DELETE"};
		option.url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${idEvent}`;
		option.headers = {'X-Google-AccountId': idAccount};
		return Axios(option);
	}

	catch (e) {
		throw e
	}
}
const updateEvent  = async (event, idCalendar, idEvent,idAccount)=>{
	try {
		const option = {method: "PUT"};
		option.url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${idEvent}`;
		option.headers = {'content-type': 'application/json', 'X-Google-AccountId': idAccount};
		option.data = event;
		return Axios(option);
	}
	catch (e) {
		throw e
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
	deleteEvent,
	updateEvent,
	handarlerShowListEvent,
	handlerDeleteEvent,
	handlerUpdateEvent,
	requestBlockActionsAllDay,
};
