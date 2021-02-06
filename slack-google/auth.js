const Axios = require('axios');
const qs = require('qs');
const Env = require('../utils/Env');
const GoogleAccount = require('../models/GoogleAccount');
const GoogleCalendar = require('../models/GoogleCalendar')


const getToken = (code,state) =>{
	return new Promise((resolve, reject) => {
		const urlGetToken = "https://oauth2.googleapis.com/token";
	//	const urlGetToken = Env.resourceServerGet("URL_API") + Env.resourceServerGet("API_TOKEN")
		let data = {
			client_id: Env.resourceServerGet("GOOGLE_CLIENT_ID"),
			client_secret: Env.resourceServerGet("GOOGLE_CLIENT_SECRET"),
			code,
			grant_type: "authorization_code",
			redirect_uri: Env.resourceServerGet("REDIRECT_URI"),
			state,
		};
		const options = {
			method: 'POST',
			headers: {'content-type': 'application/x-www-form-urlencoded'},
			data: qs.stringify(data),
			url: urlGetToken,
		};
		Axios(options)
			.then((res)=>resolve(res.data))
			.catch((err)=>reject(err));
	})
}
const getListCalendar = (accessTokenGoogle)=>{
	return new Promise(((resolve, reject) => {
		const options = {
			method: "GET",
			headers: {'Authorization': `Bearer ${accessTokenGoogle}`},
			url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
			//url: Env.resourceServerGet("URL_API") + Env.resourceServerGet("API_lIST_CALENDAR")
		}
		Axios(options)
			.then((res) => resolve(res.data))
			.catch((error) => reject(error));
	}))
}
const getProfile = (accessTokenGoogle)=>{
	return new Promise((resolve, reject) => {
		const options = {
			method: "GET",
			headers: {'Authorization': `Bearer ${accessTokenGoogle}`},
			url: "https://www.googleapis.com/oauth2/v3/userinfo",
		//	url: Env.resourceServerGet("URL_API") + Env.resourceServerGet("API_USER_INFO")
		}
		Axios(options)
			.then((res) => resolve(res.data))
			.catch((err) => reject(err));
	})
}
const saveUserProfile = (profileUser,refreshTokenGoogle)=>{
	return new Promise((resolve, reject) => {
		const account ={
			id: profileUser.sub,
			name: profileUser.name,
			refresh_token: refreshTokenGoogle,
			created_at: null,
			updated_at: null,
		}
		GoogleAccount.query()
			.findById(account.id)
			.then((user)=>{
				if(!user){
					GoogleAccount.query()
						.insert(account)
						.then((res) => resolve())
						.catch((err) => reject(err));
				}
				resolve();
			})
			.catch((err) => {
				return reject(err);
			});
	})
}
const saveListCalendar = (allCalendar) =>{
	return new Promise((resolve, reject) => {
		const arrayCalenDar = [];
		allCalendar.forEach((item)=>{
			const calendar = {
				id:item.id,
				name: item.summary,
				created_at: null,
			};
			arrayCalenDar.push(calendar);
		})
		if(!arrayCalenDar) return reject();
		arrayCalenDar.forEach(async (item)=>{
			GoogleCalendar.query()
				.findOne({id:item.id})
				.then((calendar)=>{
					GoogleCalendar.query()
						.insert(item)
						.then((res)=>{})
						.catch((err) => reject(err));
				})
				.catch((err) => reject(err));
		})
		resolve();
	})
}
const getAccessToken = async (req,res) =>{
	const { code, state } = req.body;
	try {
		const tokens = await getToken(code,state);
		const accessTokenGoogle = tokens.access_token;
		const refreshTokenGoogle = tokens.refresh_token;
		const listAllCalendar = await getListCalendar(accessTokenGoogle);
		const allCalendar = listAllCalendar.items;
		const profileUser = await getProfile(accessTokenGoogle);
		await  saveUserProfile(profileUser,refreshTokenGoogle);
		await saveListCalendar(allCalendar)
		return res.send("arrayCal");
	}
	catch (err) {
		return res.send("ERROR");
	}
}
const sendCode  = async (req,res)=>{
	const code = req.query.code;
	const state = req.query.state;
	const uri = "http://localhost:5000/watch-set-access-token";
	const data = {
		code,
		state,
	}
	const options = {
		method: 'POST',
		headers: {'content-type': 'application/json'},
		data: JSON.stringify(data),
		url: uri,
	};
	try {
		await Axios(options);
		return res.status(200).send('oke');
	} catch (err) {
		return res.status(403).send("Error");
	}
}
module.exports = {
	sendCode,
	getAccessToken
}
