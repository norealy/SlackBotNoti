const EncodeJws = require("../utils/Jws");
const ENV = require('../utils/Env');
const scopeAzure = "offline_access%20user.read%20mail.read%20calendars.readwrite";

const redirectMicrosoft = (idChannel, idMessage) => {
	try {
    const stateAzure = EncodeJws.createJWS(idChannel, idMessage);
    let urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${ENV.resourceServerGet("AZURE_ID")}&response_type=code&redirect_uri=${ENV.resourceServerGet("AZURE_REDIRECT")}&response_mode=query&scope=${scopeAzure}&state=${stateAzure}`;
		return urlRequestAuthor;
	} catch (error) {
		return "error";
	}
};

module.exports = {
	redirectMicrosoft,
};
