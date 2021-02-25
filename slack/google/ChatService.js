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


module.exports = {
	requestPostLogin,
	requestSettings,
	requestHome,
	requestButtonSettings,
	decode


}
