const qs = require("qs");
const axios = require("axios");
const Env = require("../../utils/Env");
const MicrosoftAccount = require("../../models/MicrosoftAccount");
const MicrosoftCalendar = require("../../models/MicrosoftCalendar");
const MicrosoftAccountCalendar = require("../../models/MicrosoftAccountCalendar");
const Channels = require("../../models/Channels");
const ChannelsCalendar = require("../../models/ChannelsCalendar");

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
				Env.resourceServerGet("API_URL_AUTH") +
				Env.resourceServerGet("API_TOKEN"),
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
				Env.resourceServerGet("GRAPH_URL") +
				Env.resourceServerGet("GRAPH_CALENDARS"),
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
				Env.resourceServerGet("GRAPH_URL") +
				Env.resourceServerGet("GRAPH_USER"),
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
			.then((data) => {
				if (!data) {
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
		arrayCal.forEach((item) => {
			MicrosoftCalendar.query()
				.findOne({ id: item.id, address_owner: item.address_owner })
				.then((data) => {
					if (!data) {
						MicrosoftCalendar.query()
							.insert(item)
							.then()
							.catch((err) => reject(err));
					}
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
	let url = Env.chatServiceGOF('API_URL');
	url += Env.chatServiceGOF('API_CHANNEL_INFO');
	url += idChannel;
	const options = {
		method: "POST",
		headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
		data: {
			channel: idChannel,
		},
		url,
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

/**
 * Đưa về định dạng giống với bảng microsoft_account_calendar
 * @param {string} idAccount
 * @param {Array} arrCalendar
 * @returns {Array}
 */
const customFormatMicrosoftAccountCalendar = (idAccount, arrCalendar) => {
	const arrayAccCal = [];
	arrCalendar.forEach((item) => {
		const msAccCal = {
			id_calendar: item.id,
			id_account: idAccount,
			created_at: null,
		};
		arrayAccCal.push(msAccCal);
	});
	return arrayAccCal;
};

/**
 * Luu thong tin MicrosoftAccountCalendar vao database
 * @param {string} idAccount
 * @param {Array} arrCalendar
 * @returns {Promise}
 */
const saveMicrosoftAccountCalendar = (idAccount, arrCalendar) => {
	return new Promise((resolve, reject) => {
		const arrayAccCal = customFormatMicrosoftAccountCalendar(
			idAccount,
			arrCalendar
		);
		if (!arrayAccCal) return reject();
		arrayAccCal.forEach((item) => {
			MicrosoftAccountCalendar.query()
				.findOne({ id_account: idAccount, id_calendar: item.id_calendar })
				.then((data) => {
					if (!data) {
						MicrosoftAccountCalendar.query()
							.insert(item)
							.then()
							.catch((err) => reject(err));
					}
				})
				.catch((err) => reject(err));
		});
		resolve();
	});
};

/**
 * Đưa về định dạng giống với bảng channels_calendar
 * @param {string} idChannel
 * @param {Array} arrCalendar
 * @returns {Array}
 */
const customFormatChannelsCalendar = (idChannel, arrCalendar) => {
	const arrayChannelCal = [];
	arrCalendar.forEach((item) => {
		const msChenCal = {
			id_calendar: item.id,
			id_channel: idChannel,
			watch: true,
			created_at: null,
			updated_at: null,
		};
		arrayChannelCal.push(msChenCal);
	});
	return arrayChannelCal;
};

/**
 * Luu thong tin saveChannelsCalendar vao database
 * @param {string} idChannel
 * @param {Array} arrCalendar
 * @returns {Promise}
 */
const saveChannelsCalendar = (idChannel, arrCalendar) => {
	return new Promise((resolve, reject) => {
		const arrayChanCal = customFormatChannelsCalendar(idChannel, arrCalendar);
		if (!arrayChanCal) return reject();
		arrayChanCal.forEach((item) => {
			ChannelsCalendar.query()
				.findOne({ id_channel: idChannel, id_calendar: item.id_calendar })
				.then((data) => {
					if (!data) {
						ChannelsCalendar.query()
							.insert(item)
							.then()
							.catch((err) => reject(err));
					}
				})
				.catch((err) => reject(err));
		});
		resolve();
	});
};

module.exports = {
	getToken,
	getListCalendar,
	getProfileUser,
	saveUserProfile,
	saveListCalendar,
	saveInfoChannel,
	saveMicrosoftAccountCalendar,
	saveChannelsCalendar,
};
