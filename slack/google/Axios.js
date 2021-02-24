const Axios = require('axios');
const Env = require('../../utils/Env');
const { newAccessToken } = require('./RefreshToken');
const Redis = require('../../utils/redis/index');

/**
 *
 * @param {string} key
 * @returns {*} Values
 */
function getValueRedis(key) {
	return new Promise((resolve, reject) => {
		Redis.client.get(key, (err, reply) => {
			if (err) reject(null);
			resolve(reply);
		});
	})
}

module.exports = function () {
	// Handler REQUEST
	Axios.interceptors.request.use(async function (config) {
		console.log('Start time: ', new Date().toISOString());
		 console.log('Before REQUEST: ', config);
		const { url = null, headers = null } = config;
		const {Authorization = null} = config.headers;
		if (url && url.split('.com')[0] === Env.resourceServerGet("API_URL").split('.com')[0]&&!Authorization) {
			console.log("url",url)
			const idAccount = headers['X-Google-AccountId'];
			try {
				let accessToken = await getValueRedis(idAccount);
				if (accessToken) {
					config.headers['Authorization'] = `Bearer ${accessToken}`;
					return config;
				}
				accessToken = await newAccessToken(idAccount);
				console.log("accessToken",accessToken)
				Redis.client.setex(idAccount,60 * 59, accessToken);
				config.headers['Authorization'] = `Bearer ${accessToken}`;
			} catch (error) {
				console.log("request", error)
				return Promise.reject(error);
			}
		}
		return config;
	}, function (error) {
		return Promise.reject(error);
	});

	//  Handler RESPONSE
	Axios.interceptors.response.use(function (response) {
		return response;
	}, async function (error) {
		console.log("ERROR RESPONSE DATA: ", error);
		try {
			if (error.response.data.error.code === "InvalidAuthenticationToken") {
				const idAccount = error.config.headers['X-Google-AccountId'];
				const accessToken = await newAccessToken(idAccount);
				Redis.client.setex(idAccount,60 * 59 ,accessToken);
				error.config.headers['Authorization'] = `Bearer ${accessToken}`;
				return Axios(error.config);
			}
		} catch (err) {
			console.log(err)
			return Promise.reject(err);
		}
		return Promise.reject(error);
	});
}
