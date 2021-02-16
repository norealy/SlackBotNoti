const Axios = require("axios");
const qs = require("qs");
const Env = require("../../utils/Env");
const GoogleAccount = require("../../models/GoogleAccount");
const GoogleCalendar = require("../../models/GoogleCalendar");
const Channels = require("../../models/Channels");
const GoogleAccountCalendar = require("../../models/GoogleAccountCalendar");
const ChannelsCalendar = require("../../models/ChannelsCalendar");

/**
 * Thực hiện việc lấy accesToken
 * @param {string}code
 * @param {string}state
 * @returns {Promise}
 */
const getToken = (code, state) => {
	return new Promise((resolve, reject) => {
		let url = Env.resourceServerGet("API_URL_OAUTH");
		url += `${Env.resourceServerGet("API_TOKEN")}`;
		let data = {
			client_id: Env.resourceServerGet("CLIENT_ID"),
			client_secret: Env.resourceServerGet("CLIENT_SECRET"),
			code,
			grant_type: Env.resourceServerGet("GRANT_TYPE"),
			redirect_uri: Env.resourceServerGet("REDIRECT_URI"),
			state,
		};
		const options = {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: qs.stringify(data),
			url,
		};
		Axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};

/**
 * Thông qua accessToken để list ra calendar
 * @param{string} accessTokenGoogle
 * @returns {Promise}
 */
const getListCalendar = (accessTokenGoogle) => {
	let url = Env.resourceServerGet("API_URL");
	url += `${Env.resourceServerGet("API_lIST_CALENDAR")}`;
	return new Promise((resolve, reject) => {
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenGoogle}` },
			url,
		};
		Axios(options)
			.then((res) => resolve(res.data))
			.catch((error) => reject(error));
	});
};

/**
 * accessToken để lấy ra info
 * @param {string} accessTokenGoogle
 * @returns {Promise}
 */
const getProfile = (accessTokenGoogle) => {
	let url = Env.resourceServerGet("API_URL");
	url += `${Env.resourceServerGet("API_USER_INFO")}`;
	return new Promise((resolve, reject) => {
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenGoogle}` },
			url: url,
		};
		Axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};

/**
 *
 * @param idChannel
 * @return {Promise<unknown>}
 */
const getInfoChannel = (idChannel)=>{
	return new Promise((resolve, reject) => {
		let url = Env.chatServiceGOF("API_URL");
		url += Env.chatServiceGOF("API_CHANNEL_INFO");
		url += idChannel;
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
			data:qs.stringify({channel: idChannel}),
			url,
		};
		Axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};

/**
 * Lưu profile end  refreshTokenGoogle
 * @param  {object} profileUser
 * @param {string} refreshTokenGoogle
 * @returns {Promise}
 */
const saveUserProfile = (profileUser, refreshTokenGoogle) => {
	return GoogleAccount.query()
		.insert({
			id: profileUser.sub,
			name: profileUser.name,
			refresh_token: refreshTokenGoogle,
		})
};

/**
 * Lưu list calendar
 * @param {Array} listCalendar
 * @returns {Promise}
 */
const saveListCalendar = async (listCalendar) => {
	if (!listCalendar) return null;
	for (let i = 0, length = listCalendar.length; i < length; i++) {
		const calendar = await GoogleCalendar.query().findOne({id: listCalendar[i].id});
		if (!calendar) await GoogleCalendar
			.query()
			.insert({
				id: listCalendar[i].id,
				name: listCalendar[i].summary,
			})
	}
};

/**
 * Luu thong tin channel vao database
 * @param {object} channel
 * @returns {Promise}
 */
const saveInfoChannel = (channel) => {
	return Channels.query().insert({
		id: channel.id,
		name: channel.name,
	});
};

/**
 * Lưu IdCalendar với idAccount vào db
 * @param {array} idCalendars
 * @param {String} idAccount
 * @returns {Promise}
 * @constructor
 */
const SaveGoogleAccountCalendar = (idCalendars,idAccount)=>{
	return	GoogleAccountCalendar.transaction( async trx => {
		try {
			let values = []
			for ( let idx in idCalendars) {
				const googleAccountCalendar = {
					id_calendar: idCalendars[idx],
					id_account: idAccount,
					created_at: null,
				};
				values.push(googleAccountCalendar)
			}
			await trx.insert(values).into(GoogleAccountCalendar.tableName).onConflict(["id_calendar","id_account" ]).merge();
		} catch (e) {
			trx.rollback();
			throw e
		}
	})
};

/**
 * Lưu IdCalendar với idChannel vào db
 * @param {array} idCalendars
 * @param {String}idChannel
 * @returns {Promise}
 * @constructor
 */
const SaveChannelsCalendar = async (idCalendars,idChannel)=>{
	return	ChannelsCalendar.transaction( async trx => {
		try {
			let values = [];
			for (let idx in idCalendars) {
				const ChannelsCalendar = {
					id_calendar: idCalendars[idx],
					id_channel: idChannel,
					watch: true,
					created_at: null,
					updated_at: null,
				};
				values.push(ChannelsCalendar)
			}
			await trx.insert(values).into(ChannelsCalendar.tableName).onConflict(["id_calendar", "id_channel"]).merge();
		} catch (e) {
			trx.rollback();
			throw e
		}
	})
};

module.exports = {
	getToken,
	getListCalendar,
	getProfile,
	getInfoChannel,
	saveUserProfile,
	saveInfoChannel,
	saveListCalendar,
	SaveGoogleAccountCalendar,
	SaveChannelsCalendar,
};
