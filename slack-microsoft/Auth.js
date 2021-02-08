const qs = require("qs");
const axios = require("axios");
const Env = require("../utils/Env");
const { decodeJWS } = require("./Jws");
const MicrosoftAccount = require("../models/MicrosoftAccount");
const MicrosoftCalendar = require("../models/MicrosoftCalendar");
const Channels = require("../models/Channels");

/**
 * Lay tai nguyen tokens
 * @param {string} code
 * @param {string} state
 * @returns {Promise}
 */
const getToken = (code, state) => {
	return new Promise((resolve, reject) => {
		let data = {
			client_id: Env.resourceServerGet("AZURE_ID"),
			scope: Env.resourceServerGOF("SCOPE"),
			code,
			redirect_uri: Env.resourceServerGet("AZURE_REDIRECT"),
			grant_type: "authorization_code",
			client_secret: Env.resourceServerGet("AZURE_SECRET"),
			response_mode: "form_post",
			state,
		};
		const options = {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: qs.stringify(data),
			url:
				Env.resourceServerGet("URL_API_AUTH") +
				Env.resourceServerGet("URL_API_TOKEN"),
		};
		axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};
/**
 * Lay tai nguyen  danh sach calendar
 * @param {string} accessTokenAzure
 * @returns {Promise}
 */
const getListCalendar = (accessTokenAzure) => {
	return new Promise((resolve, reject) => {
		const options1 = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenAzure}` },
			url:
				Env.resourceServerGet("URL_API") +
				Env.resourceServerGet("URL_API_CALENDARS"),
		};
		axios(options1)
			.then((res) => resolve(res.data))
			.catch((error) => reject(error));
	});
};
/**
 * Lay tai nguyen thong tin ve user Profile
 * @param {string} accessTokenAzure
 * @returns {Promise}
 */
const getProfileUser = (accessTokenAzure) => {
	return new Promise((resolve, reject) => {
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenAzure}` },
			url:
				Env.resourceServerGet("URL_API") +
				Env.resourceServerGet("URL_API_USER"),
		};
		axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};
/**
 * Luu thong tin vao database
 * @param {object} profileUser
 * @param {string} refreshTokenAzure
 * @returns {Promise}
 */
const saveUserProfile = (profileUser, refreshTokenAzure) => {
	return new Promise((resolve, reject) => {
		const account = {
			id: profileUser.id,
			name: profileUser.displayName,
			refresh_token: refreshTokenAzure,
			created_at: null,
			updated_at: null,
		};
		MicrosoftAccount.query()
			.findById(account.id)
			.then((user) => {
				if (!user) {
					MicrosoftAccount.query()
						.insert(account)
						.then((res) => resolve(res))
						.catch((err) => reject(err));
				}
				resolve();
			})
			.catch((err) => {
				return reject(err);
			});
	});
};
/**
 *  Xu ly dua array calendar ve dang
 * @param {Array} allCalendar
 * @returns {Array} array Calendar
 */
const customFormatArrayCal = (allCalendar) => {
	const arrayCal = [];
	allCalendar.forEach((item) => {
		const cal = {
			id: item.id,
			name: item.name,
			address_owner: item.owner.address,
			created_at: null,
		};
		arrayCal.push(cal);
	});
	return arrayCal;
};
/**
 *  Luu array calendar vao database
 * @param {Array} allCalendar
 * @returns {Promise}
 */
const saveListCalendar = (allCalendar) => {
	return new Promise((resolve, reject) => {
		const arrayCal = customFormatArrayCal(allCalendar);
		if (!arrayCal) return reject();
		arrayCal.forEach(async (item) => {
			MicrosoftCalendar.query()
				.findOne({ id: item.id, address_owner: item.address_owner })
				.then(() => {
					MicrosoftCalendar.query()
						.insert(item)
						.then()
						.catch((err) => reject(err));
				})
				.catch((err) => reject(err));
		});
		resolve();
	});
};

/**
 * Lay ra thong tin ve channel thong qua id channel
 * @param {string} idChannel
 * @returns {Promise}
 */
const getNameChannel = (idChannel) => {
	const tokenBot = Env.chatServiceGOF("TOKEN_BOT");
	const options = {
		method: "POST",
		headers: { Authorization: `Bearer ${tokenBot}` },
		data: {
			channel: idChannel,
		},
		url: `${Env.chatServiceGet(
			"URL_SLACK_API"
		)}conversations.info?channel=${idChannel}`,
	};
	return axios(options);
};
/**
 * Luu thong tin channel vao database
 * @param {string} idChannel
 * @returns {Promise}
 */
const saveInfoChannel = async (idChannel) => {
	const promise = new Promise((resolve) => resolve());
	const dataChannel = await getNameChannel(idChannel);
	if (!dataChannel) return promise;
	const result = await Channels.query().findById(idChannel);
	if (result) return promise;
	const channel = {
		id: idChannel,
		name: dataChannel.data.channel.name,
		created_at: null,
	};
	return Channels.query().insert(channel);
};

const getAccessToken = async (req, res) => {
	const { code, state } = req.query;
	try {
		const tokens = await getToken(code, state);
		const accessTokenAzure = tokens.access_token;
		const refreshTokenAzure = tokens.refresh_token;

		// Thuc hien lay tai nguyen list calendars
		const allData = await getListCalendar(accessTokenAzure);
		const allCalendar = allData.value;

		// Thuc hien lay tai nguyen user profile
		const profileUser = await getProfileUser(accessTokenAzure);

		// Thêm đối tượng microsoftAccount và bảng microsoft_account
		await saveUserProfile(profileUser, refreshTokenAzure);

		// Thêm list calendar vào bảng microsoft_calendar
		await saveListCalendar(allCalendar);

		// Lay Decode jwt de lay ra data
		const { idChannel, idUser } = await decodeJWS(state);

		// Thêm channelvào bảng channels
		await saveInfoChannel(idChannel);

		return res.send("Successful !");
	} catch (e) {
    console.log(e);
		return res.send("Login Error !");
	}
};

module.exports = {
	getAccessToken,
};
