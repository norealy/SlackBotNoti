const qs = require('qs');
const axios = require('axios');
const ENV = require('../utils/Env');
const stateSecretAzure = ENV.get("AZURE_STATE", 'RANDOMID@@--123');
const stateAzure = Buffer.from(stateSecretAzure).toString('base64')
const redirectUrlAzure = ENV.get("AZURE_REDIRECT", "http://localhost:4000/auth/microsoft");
const scopeAzure = "calendars.readwrite";
const azureIdAzure = ENV.get("AZURE_ID");
const secretAzure = ENV.get("AZURE_SECRET");

const redirectMicrosoft = (req, res) => {
	try {
		const urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${azureIdAzure}&response_type=code&redirect_uri=${redirectUrlAzure}&response_mode=query&scope=${scopeAzure}&state=${stateAzure}`;
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
        res.cookie('accessTokenAzure', "EwBwA8l6BAAU6k7+XVQzkGyMv7VHB/h4cHbJYRAAAXWd0KCkiL691GHxQbtb7vRTEOSX5pw0URU1Y0TGuXr2SBhpyuNfuQceC7eWEo/bWrsqpF5V0nRVK91uWZfeTznhAklzkywPqIePI3ZLtNXK7D8wBe8fx5nUjPOqKOg4tesxP/Tc3Jtfl35z18nZzGfuLMV2bwYDun4vYKY6Dfopj32tmGetCk4gHNXgY2OrB+8bfH0wE2ryDQLgav02uS6N2BGtXNVqmytkXdefYOCZbNIEHlKN8N/22PS3ofBKh1KpVM2SHxDfk0IL/8mCMgxFMhg50+24f0qVf1lR/xNvTVgXeJi2NwukR9x4FECEaq2xnYzdJHzqF+ekuMMB5UADZgAACDasySjAiq/YQAIiCOYIC4Ku0yOihQG0H8fYKHsF0K/gfAIqo8w7tkC6C/dDpaRKeySIOK/YEa5DshnnxRLrSV0UTDzRYvzNYD5nEvCxJlusw4YUp8EuxQTS8rQ2YmBcLo+WpCMdliNyPjiQ4EPn7BzeZEGnvlFQ7CktMDIsETDFb5Dw5cYPLdsKHEuRUR7TkgIfhL7etrdDw1VnoFbZBWE6nAJiSS1sLJbOgtEFb/U1fpaco9DArSosgN7KGd3p0v3trjgpBkK/CGXga7eOWeu2EdgMdoIto0/lnPoDljvyA9OeLoCEPn3jyvX5d6BpjIKgEcf7orOz5611HK4+icQq4HTLo7K/EcoT5I/tw0ylp23GULETVQNTnnX74uHYBMDFO9XVENgfifCF4Zoyhd/zuS1ksj456Gknc+bMMXjzvDBKpWNrqcFLzJk6T0T9n024YS+CsFvcqVyIx0IsjWyz3zujvmX3fwuC5AN4cH3/rpbQsWTP4CLbMfmk7K9bRuRUDlzqFqXrBKS76Y8nA3TinLDt83PAyQ79RtFjlXqd33eGrfzwVelnk1ynWLdkpwFHRN2BCRKBYDQ94sCII10j7QjsuKERU5Abinm0PqBDS06fYnQ9M2JsTkLh0aNwww2Lc4dHug9SCs5BzcUBAlAFi9xuecb43yEwFO7ZlJxrnNbOBAyDWhsEmPui0oRJUiPHt/WKcswLUqLYnJBJRR1KjoFqkYr3G8jlZzlZtEIHAOBIcy4Izk5dDpU6JJGRg3uUMd6dNi3ypa94Ag==");
		return res.status(200).send("Post Code ok");
	} catch (error) {
		return res.status(403).send("Error");
	}
};

const setAccessTokenToCookie = async (req, res) => {
	const code = req.body.code;
	console.log(stateAzure);
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
		console.log(accessTokenAzure)
		
		return res.status(200).send("Done");
	} catch (e) {
		console.log("Error")
		return res.status(403).send("Error")
	}
};

module.exports = {
    redirectMicrosoft,
    sendCode,
    setAccessTokenToCookie
}