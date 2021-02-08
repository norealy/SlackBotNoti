const Axios = require("axios");
const qs = require("qs");
const Env = require("../utils/Env");
const ChatService = require('./ChatService');
const GoogleAccount = require("../models/GoogleAccount");
const GoogleCalendar = require("../models/GoogleCalendar");
const Channels = require("../models/Channels");
const GoogleAccountCalendar = require("../models/GoogleAccountCalendar");
const ChannelsCalendar = require("../models/ChannelsCalendar")
/**
 * Thực hiện việc lấy accesToken
 * @param {string}code
 * @param {string}state
 * @returns {Promise}
 */
const getToken = (code, state) => {
	return new Promise((resolve, reject) => {
		let url = Env.resourceServerGet("URL_API_OAUTH");
		url += `${Env.resourceServerGet("API_TOKEN")}`;
		let data = {
			client_id: Env.resourceServerGet("GOOGLE_CLIENT_ID"),
			client_secret: Env.resourceServerGet("GOOGLE_CLIENT_SECRET"),
			code,
			grant_type: "authorization_code",
			redirect_uri: Env.resourceServerGet("REDIRECT_URI"),
			state,
		};
		const options = {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: qs.stringify(data),
			url: url,
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
	let url = Env.resourceServerGet("URL_API");
	url += `${Env.resourceServerGet("API_lIST_CALENDAR")}`;
	return new Promise((resolve, reject) => {
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenGoogle}` },
			url: url,
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
	let url = Env.resourceServerGet("URL_API");
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

const getIdChannel = (idChannel)=>{
	const data = {
		channel: idChannel,
	};
	return new Promise((resolve, reject) => {
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${Env.chatServiceGOF("TOKEN_BOT")}` },
			data:qs.stringify(data),
			url: `${Env.chatServiceGOF("URL_SLACK_API")}conversations.info?channel=${idChannel}`
		};
		Axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
}
/**
 * Lưu profile end  refreshTokenGoogle
 * @param  {object} profileUser
 * @param {string} refreshTokenGoogle
 * @returns {Promise}
 */
const saveUserProfile = (profileUser, refreshTokenGoogle) => {
	return new Promise((resolve, reject) => {
		const account = {
			id: profileUser.sub,
			name: profileUser.name,
			refresh_token: refreshTokenGoogle,
			created_at: null,
			updated_at: null,
		};
		GoogleAccount.query()
			.findById(account.id)
			.then((data) => {
				if (!data) {
					GoogleAccount.query()
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
 * Lưu list calendar
 * @param {Array} allCalendar
 * @returns {Promise}
 */

const saveListCalendar = (allCalendar) => {
	return new Promise((resolve, reject) => {
		const arrayCalenDar = []
		allCalendar.forEach((item) => {
			const calendar = {
				id: item.id,
				name: item.summary,
				created_at: null,
			};
			arrayCalenDar.push(calendar);
		});
		if (!arrayCalenDar) return reject();
		arrayCalenDar.forEach(async (item) => {
			GoogleCalendar.query()
				.findOne({ id: item.id })
				.then((calendar) => {
					GoogleCalendar.query()
						.insert(item)
						.then((res) => {})
						.catch((err) => reject(err));
				})
				.catch((err) => reject(err));
		});
		resolve();
	});
};
/**
 * Luu thong tin channel vao database
 * @param {string} idChannel
 * @returns {Promise}
 */
const saveInfoChannel = async (idChannel) => {
	const promise = new Promise((resolve) => resolve());
	const dataChannel = await getIdChannel(idChannel);
	if (!dataChannel) return promise;
	const result = await Channels.query().findById(idChannel);
	if (result) return promise;
	const channel = {
		id: idChannel,
		name: dataChannel.channel.name,
		created_at: null,
	};
	return Channels.query().insert(channel);
};
/**
 * Lưu IdCalendar với idAccount vào db
 * @param {String} idCalendars
 * @param {String} idAccount
 * @returns {Promise}
 * @constructor
 */
const SaveGoogleAccountCalendar = async (idCalendars,idAccount)=>{
	return	GoogleAccountCalendar.transaction( async trx => {
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
	})
}
/**
 * Lưu IdCalendar với idChannel vào db
 * @param {String} idCalendars
 * @param {String}idChannel
 * @returns {Promise}
 * @constructor
 */
const SaveChannelsCalendar = async (idCalendars,idChannel)=>{

	return	ChannelsCalendar.transaction( async trx => {
		let values = []
		for ( let idx in idCalendars) {
			const ChannelsCalendar = {
				id_calendar: idCalendars[idx],
				id_channel: idChannel,
				watch:true,
				created_at: null,
				updated_at: null,
			};
			values.push(ChannelsCalendar)
		}
		await trx.insert(values).into(ChannelsCalendar.tableName).onConflict(["id_calendar","id_channel" ]).merge();
	})
}
const getAccessToken = async (req, res) => {
	const { code, state } = req.query;
	try {
		const tokens = await getToken(code, state);
		const accessTokenGoogle = tokens.access_token;
		const refreshTokenGoogle = tokens.refresh_token;
		const listAllCalendar = await getListCalendar(accessTokenGoogle);
		const allCalendar = listAllCalendar.items;
		const profileUser = await getProfile(accessTokenGoogle);
		const idAccount = profileUser.sub
		await saveUserProfile(profileUser, refreshTokenGoogle);
		await saveListCalendar(allCalendar);
		const {idChannel, idUser} = await ChatService.decode(state)
		await saveInfoChannel(idChannel)
		// xử lí mảng để lưu
		let idCalendars = []
		for (let calendar of listAllCalendar.items){
			idCalendars.push(calendar.id )
		}
		// profileUser +  listAllCalendar
		await SaveGoogleAccountCalendar(idCalendars, idAccount)
		await SaveChannelsCalendar(idCalendars,idChannel)
		return res.send("Oke");
	} catch (err) {
		return res.send("ERROR");
	}
};
module.exports = {
	getAccessToken,
};
