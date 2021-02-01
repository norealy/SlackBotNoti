const qs = require('qs');
const axios = require('axios');
const ENV = require('../utils/Env');
const stateSecretAzure = ENV.get("AZURE_STATE", 'RANDOMID@@--123');
const stateAzure = Buffer.from(stateSecretAzure).toString('base64');
const redirectUrlAzure = ENV.get("AZURE_REDIRECT", `http://localhost:5100/auth/microsoft`);
const scopeAzure = "offline_access user.read mail.read calendars.readwrite";
const azureIdAzure = ENV.get("AZURE_ID");
const secretAzure = ENV.get("AZURE_SECRET");

const redirectMicrosoft = (req, res) => {
	try {
		const urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${azureIdAzure}&response_type=code&redirect_uri=${redirectUrlAzure}&response_mode=query&scope=${scopeAzure}`; //&state=${stateAzure}
		return res.status(301).redirect(urlRequestAuthor)
	} catch (error) {
		return res.status(403).send("Error");
	}
};

const sendCode = async (req, res) => {
	const code = req.query.code;
	console.log("Code :", code)
	const url = "http://localhost:5100/code";
	const data = {
		code: code
	};
	const options = {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		data: JSON.stringify(data),
		url: url,
	};
	try {
		const result = await axios(options);
		console.log("result",result.data)
		res.send("POst Code ok")
		return;
	} catch (error) {
		res.send("error")
		return;
	}
};

const getAccessToken = async (req, res) => {
	console.log(req.path)
	const code = req.body.code;
	const urlGetToken = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
	let data = {
		client_id: azureIdAzure,
		scope: scopeAzure,
		code: code,
		redirect_uri: redirectUrlAzure,
		grant_type: "authorization_code",
		client_secret: secretAzure,
		response_mode: "form_post"
	};
	const options = {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		data: qs.stringify(data),
		url: urlGetToken,
	};
	try {
		const result = await axios(options);
		const accessTokenAzure = result.data.access_token;
		const refreshTokenAzure = result.data.refresh_token;
		// console.log(result.data)

		const options1 = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${accessTokenAzure}` },
            url: "https://graph.microsoft.com/v1.0/me/calendars"
        };
        const resultCal = await axios(options1);
		const allCalendar = resultCal.data;
		console.log("allCalendar",allCalendar);

		const options2 = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${accessTokenAzure}` },
            url: "https://graph.microsoft.com/v1.0/me"
        };
        const resultUser = await axios(options2);
		const profileUser = resultUser.data;
		console.log("allCalendar",profileUser);

		return res.send("");
	} catch (e) {
		console.log(e)
		return res.send(e)
	}
};

module.exports = {
    redirectMicrosoft,
    sendCode,
    getAccessToken
}