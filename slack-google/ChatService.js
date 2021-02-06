const Env = require('../utils/Env');
const Jwt = require('jsonwebtoken');
const Axios = require('axios');

const configUrlAuth = (accessToken) => {
	let url = Env.resourceServerGOF('API_OAUTH')
	url += `?access_type=${Env.resourceServerGet("ACCESS_TYPE")}`
	url += `&scope=${Env.resourceServerGet("SCOPE_CALENDAR_READONLY")}`
	url += `+${Env.resourceServerGet("SCOPE_USER_INFO")}`
	url += `&response_type=${Env.resourceServerGet("RESPONSE_TYPE")}`
	url += `&client_id=${Env.resourceServerGet("GOOGLE_CLIENT_ID")}`
	url += `&redirect_uri=${Env.resourceServerGet("REDIRECT_URI")}`
	url += `&state=${accessToken}`;
	return url
}
/**
 *
 * @param uid
 * @param channel
 * @returns {*}
 */
const createJwt = (uid, channel) => {
	const header = {alg: "HS256", typ: "JWT"}
	const payload = {idUser: uid, idChannel: channel}
	const expiresIn = Env.serverGOF("JWT_DURATION")
	const key = Env.serverGOF("JWT_KEY")
	return Jwt.sign({header, payload, expiresIn}, key)
}
/**
 *
 * @param event
 * @param loginResource
 * @returns {AxiosPromise | *}
 */
const requestPostLogin = (event, loginResource) => {
	const option = {method: "POST"}
	option.url = Env.chatServiceGOF('API_POST_MESSAGE')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`}
	const {inviter,channel}= event;
	const accessToken = createJwt(inviter,channel);
	loginResource[3].elements[0].url = configUrlAuth(accessToken);
	option.data = {
		"channel": event.channel,
		"blocks": loginResource
	}
	return Axios(option);
}
/**
 *
 * @param body
 * @param viewsAdd
 * @returns {AxiosPromise | *}
 */
const requestAddEvent = (body,viewsAdd)=>{
	const option = {method: "POST"}
	option.url = Env.chatServiceGOF('API_POST_VIEW_OPEN')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`}
	const {trigger_id} = body;
	option.data = {
		"trigger_id": trigger_id,
		"view": viewsAdd
	}
	return Axios(option);
}
/**
 *
 * @param body
 * @param systemSetting
 * @returns {AxiosPromise | *}
 */
const requestSettings = (body,systemSetting)=>{
	const option = {method: "POST"}
	option.url = Env.chatServiceGOF('API_POST_VIEW_OPEN')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`}
	const {user_id,channel_id}= body;
	const {trigger_id} = body;
	const accessToken = createJwt(user_id,channel_id);
	systemSetting.blocks[3].elements[0].url = configUrlAuth(accessToken)
	option.data = {
		"trigger_id": trigger_id,
		"view": systemSetting,
	}
	return Axios(option);
}
/**
 *
 * @param body
 * @param homePage
 * @returns {AxiosPromise | *}
 */
const requestHome = (body,homePage)=>{
	const option = {method: "POST"}
	option.url = Env.chatServiceGOF('API_POST_VIEW_PUBLISH')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`}
	const {user_id,trigger_id} = body;
	option.data = {
		"user_id": user_id,
		"trigger_id": trigger_id,
		"view": homePage,
	}
	return Axios(option);
}
/**
 *
 * @param body
 * @param listCalendar
 * @returns {AxiosPromise | *}
 */
const requestAllCalendar = (body,listCalendar)=>{
	const option = {method: "POST"}
	option.url = Env.chatServiceGOF('API_POST_MESSAGE')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`}
	const {channel_id} = body;
	option.data = {
		"channel": channel_id,
		"blocks": listCalendar,
	}
	return Axios(option);
}

const requestListEvent = (body,listEvent, payload)=>{
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_POST_MESSAGE')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`};
	const {trigger_id} = body;
	option.data = {
		"trigger_id": trigger_id,
		"channel": payload.channel.id,
		"blocks": listEvent
	}
	return Axios(option);
}
const requestButtonDelete = (deleteEvent,payload) =>{
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_POST_VIEW_PUSH')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`};
	option.data = {
		"trigger_id": payload.trigger_id,
		"view": deleteEvent
	}
	return Axios(option);
}
const requestButtonUpdate = (editEvent,payload) =>{
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_POST_VIEW_OPEN')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`};
	option.data = {
		"trigger_id": payload.trigger_id,
		"view": editEvent
	}
	return Axios(option);
}

const requestButtonSettings = (payload,systemSetting,) =>{
	const option = {method: "POST"};
	option.url = Env.chatServiceGOF('API_POST_VIEW_OPEN')
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("TOKEN_BOT")}`};
	const {user,trigger_id}= payload;
	const accessToken = createJwt(user.id,user.name);
	option.data = {
		"trigger_id": trigger_id,
		"view": systemSetting
	}
	option.data.view.blocks[3].elements[0].url = configUrlAuth(accessToken)
	return Axios(option);
}

module.exports = {
	requestPostLogin,
	requestAddEvent,
	requestSettings,
	requestHome,
	requestAllCalendar,
	requestListEvent,
	requestButtonUpdate,
	requestButtonDelete,
	requestButtonSettings,
}
