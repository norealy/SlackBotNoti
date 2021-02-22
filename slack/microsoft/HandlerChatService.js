const Axios = require("axios");
const EncodeJws = require("./Jws");
const ENV = require("../../utils/Env");

/**
 * Tao url request author
 * @param {string} idChannel
 * @param {string} idUser
 * @returns {string} urlRequestAuthor
 */
const redirectMicrosoft = (idChannel, idUser) => {
	try {
		const scopeAzure = ENV.resourceServerGet("SCOPE");
		const stateAzure = EncodeJws.createJWS(idChannel, idUser);
		let urlRequestAuthor = `${ENV.resourceServerGet(
			"API_URL_AUTH"
		)}${ENV.resourceServerGet("API_AUTHOR")}`;
		urlRequestAuthor += `?client_id=${ENV.resourceServerGet("AZURE_ID")}`;
		urlRequestAuthor += `&response_type=code&redirect_uri=${ENV.resourceServerGet(
			"AZURE_REDIRECT"
		)}`;
		urlRequestAuthor += `&response_mode=query&scope=${encodeURIComponent(scopeAzure)}&state=${stateAzure}`;
    return urlRequestAuthor;
	} catch (error) {
		return "error";
	}
};

/**
 * Xu ly gui tin nhan yeu cau login
 * @param {object} event
 * @param {view} viewLoginResource
 * @returns {Promise}
 */
const sendMessageLogin = (event, viewLoginResource) => {
	return new Promise((resolve, reject) => {
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ENV.chatServiceGOF("BOT_TOKEN")}`,
			},
			data: {
				channel: event.channel,
				blocks: viewLoginResource,
			},
			url:
				ENV.chatServiceGet("API_URL") +
				ENV.chatServiceGet("API_POST_MESSAGE"),
		};
		const { channel, inviter } = event;
		options.data.blocks[2].elements[1].url = redirectMicrosoft(
			channel,
			inviter
		);
		Axios(options)
			.then((result) => resolve(result))
			.catch((err) => reject(err));
	});
};

/**
 * Xu ly nguoi dung goi den settings
 * @param {object} viewSystemSetting
 * @param {object} body
 * @returns {Promise}
 */
const handlerSettingsMessage = (viewSystemSetting, body) => {
	return new Promise((resolve, reject) => {
		const data = {
			trigger_id: body.trigger_id,
			view: viewSystemSetting,
		};
		const options = {
			method: "POST",
			headers: { Authorization: `Bearer ${ENV.chatServiceGOF("BOT_TOKEN")}` },
			data: data,
			url:
				ENV.chatServiceGet("API_URL") + ENV.chatServiceGet("API_VIEW_OPEN"),
		};
		const { channel_id, user_id } = body;
		options.data.view.blocks[3].elements[1].url = redirectMicrosoft(
			channel_id,
			user_id
		);
		Axios(options)
			.then((data) => {
				return resolve(data);
			})
			.catch((err) => reject(err));
	});
};

module.exports = {
	handlerSettingsMessage,
	sendMessageLogin,
};
