const qs = require("qs");
const axios = require("axios");
const ENV = require("../utils/Env");
const { decodeJWS } = require("../utils/Jws");
const viewsDesign = require("../views/ViewsDesign");
const MicrosoftAccount = require("../models/MicrosoftAccount");
const MicrosoftCalendar = require("../models/MicrosoftCalendar");

const getToken = (code, state) => {
	return new Promise((resolve, reject) => {
		const urlGetToken =
			"https://login.microsoftonline.com/common/oauth2/v2.0/token";
		let data = {
			client_id: ENV.resourceServerGet("AZURE_ID"),
			scope: ENV.resourceServerGOF("SCOPE"),
			code,
			redirect_uri: ENV.resourceServerGet("AZURE_REDIRECT"),
			grant_type: "authorization_code",
			client_secret: ENV.resourceServerGet("AZURE_SECRET"),
			response_mode: "form_post",
			state,
		};
		const options = {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: qs.stringify(data),
			url: urlGetToken,
		};
		axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};

const getListCalendar = (accessTokenAzure) => {
	return new Promise((resolve, reject) => {
		const options1 = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenAzure}` },
			url: "https://graph.microsoft.com/v1.0/me/calendars",
		};
		axios(options1)
			.then((res) => resolve(res.data))
			.catch((error) => reject(error));
	});
};

const getProfileUser = (accessTokenAzure) => {
	return new Promise((resolve, reject) => {
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenAzure}` },
			url: "https://graph.microsoft.com/v1.0/me",
		};
		axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};

const sendMessageListCalendarToChannel = (idChannel, allCalendar) => {
	return new Promise((resolve, reject) => {
		const data1 = {
			channel: idChannel,
			blocks: viewsDesign.listCalendar(allCalendar),
		};
		const tokenBot = ENV.chatServiceGet("TOKEN_BOT");
		const options = {
			method: "POST",
			headers: { Authorization: `Bearer ${tokenBot}` },
			data: data1,
			url: `https://slack.com/api/chat.postMessage`,
		};
		axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	});
};

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

const saveListCalendar = (allCalendar) => {
	return new Promise((resolve, reject) => {
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

		if (!arrayCal) return reject();
		arrayCal.forEach(async (item) => {
			MicrosoftCalendar.query()
				.findOne({ id: item.id, address_owner: item.address_owner })
				.then((acc) => {
					console.log("======= Account =======: ", acc);
					MicrosoftCalendar.query()
						.insert(item)
						.then((res) => console.log(res)) // Doan nay k resovle vi con nhieu cai de luu
						.catch((err) => reject(err));
				})
				.catch((err) => reject(err));
		});
		resolve();
	});
};

const getAccessToken = async (req, res) => {
  const { code, state } = req.body;
  console.log(req.body)
	try {
		// Thuc hien lay access va refresh token
		const tokens = await getToken(code, state);
		const accessTokenAzure = tokens.access_token;
		const refreshTokenAzure = tokens.refresh_token;
    console.log(refreshTokenAzure)
		// Thuc hien lay tai nguyen list calendars
		const allData = await getListCalendar(accessTokenAzure);
		const allCalendar = allData.value;

		// Thuc hien lay tai nguyen user profile
		const profileUser = await getProfileUser(accessTokenAzure);

		// Thuc hien lay giai ma jwt lay ra idChannel idMessage
		const { idChannel, idMessage } = await decodeJWS(state);

		// Thêm đối tượng microsoftAccount và bảng microsoft_account
		await saveUserProfile(profileUser, refreshTokenAzure);

		// Thêm list calendar vào bảng microsoft_calendar
		await saveListCalendar(allCalendar);

		// Thuc hien gửi danh sách calendar về channel add App
		await sendMessageListCalendarToChannel(idChannel, allCalendar);

		return res.send("arrayCal");
	} catch (e) {
		console.log(e);
		return res.send("ERROR");
	}
};

const sendCode = async (req, res) => {
	// console.log("query : ",req.query);
	const code = req.query.code;
	const state = req.query.state;
	const url = `http://localhost:${ENV.serverGet("PORT")}/auth/code`;
	const data = {
		code,
		state,
	};
	const options = {
		method: "POST",
		headers: { "content-type": "application/json" },
		data: data,
		url: url,
	};
	try {
		const result = await axios(options);
		// console.log("result", result.data);
		res.send("Successful !");
		return;
	} catch (error) {
		res.send("error");
		return;
	}
};

module.exports = {
	sendCode,
	getAccessToken,
};
