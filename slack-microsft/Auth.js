const qs = require("qs");
const axios = require("axios");
const ENV = require("../utils/Env");
const {decodeJWS} = require("../utils/Jws");
const {saveUerProfile,saveListCalendar} = require("../utils/InsertDataAuth");
const scopeAzure = "offline_access user.read mail.read calendars.readwrite";
const viewsDesign = require("../views/ViewsDesign");

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

const getAccessToken = async (req, res) => {
	const {code,state} = req.body;
	const urlGetToken =
		"https://login.microsoftonline.com/common/oauth2/v2.0/token";
	let data = {
		client_id: ENV.resourceServerGet("AZURE_ID"),
		scope: scopeAzure,
		code : code,
		redirect_uri: ENV.resourceServerGet("AZURE_REDIRECT"),
		grant_type: "authorization_code",
		client_secret: ENV.resourceServerGet("AZURE_SECRET"),
		response_mode: "form_post",
		state : state
	};
	const optionss = {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		data: qs.stringify(data),
		url: urlGetToken,
  };

	try {
    // Thuc hien lay access va refresh token
    let result = await axios(optionss);
		const accessTokenAzure = result.data.access_token;
		const refreshTokenAzure = result.data.refresh_token;

    // Thuc hien lay tai nguyen list calendars
		const options1 = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenAzure}` },
			url: "https://graph.microsoft.com/v1.0/me/calendars",
		};
		const resultCal = await axios(options1);
		const allCalendar = resultCal.data.value;

    // Thuc hien lay tai nguyen user profile
		const options2 = {
			method: "GET",
			headers: { Authorization: `Bearer ${accessTokenAzure}` },
			url: "https://graph.microsoft.com/v1.0/me",
		};
		const resultUser = await axios(options2);
		const profileUser = resultUser.data;

    // Thuc hien lay giai ma jwt lay ra idChannel idMessage
    const {idChannel,idMessage} = await decodeJWS(state);

    // Thuc hien gửi danh sách calendar về channel add App
		const data1 = {
			channel: idChannel || "C01MBMSNBPT",
			blocks: viewsDesign.listCalendar(allCalendar),
    };
    const tokenBot = ENV.chatServiceGet("TOKEN_BOT");
		const options3 = {
			method: "POST",
			headers: { Authorization: `Bearer ${tokenBot}` },
			data: data1,
			url: `https://slack.com/api/chat.postMessage`,
		};
    result = await axios(options3);

    // tao đối tượng microsoftAccount để thêm vào csdl
		const microsoftAccount = {
			id: profileUser.id,
			name: profileUser.displayName,
			refresh_token: refreshTokenAzure,
			created_at: null,
			updated_at: null,
    };

    // Thêm đối tượng microsoftAccount và bảng microsoft_account
    const saveProfile = await saveUerProfile(microsoftAccount);

    // tao list đối tượng calendars để thêm vào csdl
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

    // Thêm list calendar và bảng microsoft_calendar
    const saveCals = await saveListCalendar(arrayCal);

		return res.send("arrayCal");
	} catch (e) {
		console.log(e);
		return res.send("ERROR");
	}
};

module.exports = {
	sendCode,
	getAccessToken,
};
