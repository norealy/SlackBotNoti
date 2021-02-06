const Axios = require("axios");
const EncodeJws = require("./Jws");
const ENV = require('../utils/Env');
const scopeAzure = "offline_access%20user.read%20mail.read%20calendars.readwrite";

const redirectMicrosoft = (idChannel, idUser) => {
	try {
    const stateAzure = EncodeJws.createJWS(idChannel, idUser);
    let urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${ENV.resourceServerGet("AZURE_ID")}&response_type=code&redirect_uri=${ENV.resourceServerGet("AZURE_REDIRECT")}&response_mode=query&scope=${scopeAzure}&state=${stateAzure}`;
		return urlRequestAuthor;
	} catch (error) {
		return "error";
	}
};

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
		options.data.view.blocks[3].elements[1].url = redirectMicrosoft(
			body.channel,
			body.user_id
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
};
