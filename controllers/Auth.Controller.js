const qs = require('qs');
const axios = require('axios');
const ENV = require('../utils/Env');
const stateSecretSlack = ENV.get("STATE", 'RANDOMID@@--123');
const stateSlack = Buffer.from(stateSecretSlack).toString('base64')
const redirectUrlSlack = ENV.get("REDIRECT_URI", "http://localhost:4000/auth/slack");
const scopeSlack = "channels:read+channels:write+users:read";
const CLIENT_ID = ENV.get("CLIENT_ID");
const clientSecretSlack =  ENV.get("CLIENT_SECRET");

const redirect = (req, res) => {
	try {
		const urlRequestAuthor = `https://slack.com/oauth/authorize?client_id=${CLIENT_ID}&scope=${scopeSlack}&redirect_uri=${redirectUrlSlack}&state=${stateSlack}`
		return res.status(301).redirect(urlRequestAuthor)
	} catch (error) {
		return res.status(403).send("Error");
	}
};

const sendCode = async (req, res) => {
	const code = req.query.code;
	console.log("Code :", code)
	const uri = "http://localhost:4000/auth/code";
	const data = {
		code: code
	};
	const options1 = {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		data: JSON.stringify(data),
		url: uri,
	};
	try {
        await axios(options1);
        // res.cookie('accessTokenSlack', "xoxp-1648454437793-1629047264054-1641609298326-e252db6810f38ce3c6b1b8187c7e18c8");
		return res.status(200).send("Post Code ok");
	} catch (error) {
		return res.status(403).send("Error");
	}
};

const setAccessToken = async (req, res) => {
	const code = req.body.code;
	console.log(stateSlack);
	const urlGetToken = "https://slack.com/api/oauth.access";
	let data = {
		client_id: CLIENT_ID,
		client_secret: clientSecretSlack,
		code: code,
		redirect_uri: redirectUrlSlack
	};
	const options = {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		data: qs.stringify(data),
		url: urlGetToken,
	};
	try {
		const result = await axios(options);
		const accessTokenSlack = result.data.access_token;
		console.log(accessTokenSlack)
		return res.status(200).send("Done");
	} catch (e) {
		console.log("Error")
		return res.status(403).send("Error")
	}
};

module.exports = {
    redirect,
    sendCode,
    setAccessToken,
}