const Axios = require("axios");
const EncodeJws = require("./Jws");
const ENV = require("../utils/Env");
const scopeAzure =
	"offline_access%20user.read%20mail.read%20calendars.readwrite";
/**
 *
 * @param {*} idChannel
 * @param {*} idUser
 */
const redirectMicrosoft = (idChannel, idUser) => {
	try {
		const stateAzure = EncodeJws.createJWS(idChannel, idUser);
		let urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?`
    urlRequestAuthor += `client_id=${ENV.resourceServerGet("AZURE_ID")}`;
		urlRequestAuthor += `&response_type=code&redirect_uri=${ENV.resourceServerGet("AZURE_REDIRECT")}`
    urlRequestAuthor += `&response_mode=query&scope=${scopeAzure}&state=${stateAzure}`;
		return urlRequestAuthor;
	} catch (error) {
		return "error";
	}
};

/**
 *
 * @param {*} event
 * @param {*} viewLoginResource
 * @param {*} tokenBot
 */
const sendMessageLogin = (event, viewLoginResource, tokenBot) => {
	return new Promise((resolve, reject) => {
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${tokenBot}`,
			},
			data: {
				channel: event.channel,
				blocks: viewLoginResource,
			},
			url: "https://slack.com/api/chat.postMessage",
		};
		const { channel, inviter } = event;
		options.data.blocks[3].elements[1].url = redirectMicrosoft(
			channel,
			inviter
		);
		Axios(options)
			.then((result) => {
				return resolve(result);
			})
			.catch((err) => {
				return reject(err);
			});
	});
};

/**
 *
 * @param {*} viewSystemSetting
 * @param {*} body
 * @param {*} tokenBot
 */
const handlerSettingsMessage = (viewSystemSetting, body, tokenBot) => {
	return new Promise((resolve, reject) => {
		const data = {
			trigger_id: body.trigger_id,
			view: viewSystemSetting,
		};
		const options = {
			method: "POST",
			headers: { Authorization: `Bearer ${tokenBot}` },
			data: data,
			url: `https://slack.com/api/views.open`,
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
