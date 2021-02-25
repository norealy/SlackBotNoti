const Env = require("../../utils/Env");
const {createJWT} = require('../../utils/Crypto');

/**
 * Cấu hình đường dẫn redirect login google
 * @returns {string} url
 */
const configUrlAuthGoogle = () => {
	let url = Env.resourceServerGOF('GO_API_OAUTH');
	url += `/?scope=${Env.resourceServerGOF("GO_SCOPE_CALENDAR")}`;
	url += `+${Env.resourceServerGOF("GO_SCOPE_USER_INFO")}`;
	url += `&access_type=${Env.resourceServerGOF("GO_ACCESS_TYPE")}`;
	url += `&response_type=${Env.resourceServerGOF("GO_RESPONSE_TYPE")}`;
	url += `&client_id=${Env.resourceServerGOF("GO_CLIENT_ID")}`;
	url += `&redirect_uri=${Env.resourceServerGOF("GO_REDIRECT_URI")}`;
	return url
};

/**
 * Cấu hình đường dẫn redirect login Microsoft
 * @returns {string} urlRequestAuthor
 */
const configUrlAuthMicrosoft = () => {
	let url = Env.resourceServerGet("MI_API_URL_AUTH");
	url += Env.resourceServerGet("MI_API_AUTHOR");
	url += `/?scope=${encodeURIComponent(Env.resourceServerGet("MI_SCOPE"))}`;
	url += `&response_type=${Env.resourceServerGOF("MI_RESPONSE_TYPE")}`;
	url += `&response_mode=${Env.resourceServerGOF("MI_RESPONSE_MODE")}`;
	url += `&client_id=${Env.resourceServerGet("MI_AZURE_ID")}`;
	url += `&redirect_uri=${Env.resourceServerGet("MI_AZURE_REDIRECT")}`;
	return url;
};

/**
 * Thực thi việc requestLogin gửi về một Post Message
 * @param {object} event
 * @param {array} view
 * @returns {object}
 */
const handlerOptionLogin = (event, view) => {
	const viewLogin = [...view];
	const option = {};
	option.method = "POST";
	option.url = Env.chatServiceGOF('API_URL');
	option.url += Env.chatServiceGOF('API_POST_MESSAGE');
	option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
	const {channel} = event;
	const iat = Math.floor(new Date()/1000);
	const payload = {
		idChannel: channel,
		iat,
		exp: iat + parseInt(Env.getOrFail("JWT_DURATION"))
	};
	const accessToken = createJWT(payload);
	let urlLogin = Env.resourceServerGOF("URL");
	urlLogin += `${Env.resourceServerGOF("URI_LOGIN")}`;
	urlLogin += `/?accessToken=${accessToken}&redirect=`;
	viewLogin[2].elements[0].url = urlLogin + "GOOGLE";
	viewLogin[2].elements[1].url = urlLogin + "MICROSOFT";
	option.data = {
		"channel": channel,
		"blocks": viewLogin
	};
	return option;
};

module.exports = {
	handlerOptionLogin,
	configUrlAuthGoogle,
	configUrlAuthMicrosoft,
};
