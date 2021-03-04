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
		const { url = null, headers = null } = config;
		const {Authorization = null} = config.headers;
		const regex = new RegExp(`^${Env.resourceServerGet("API_URL")}`);
		const idAccount = headers['X-Google-AccountId'];
		if (url && regex.test(url) && !Authorization && idAccount) {
			try {
				let accessToken = await getValueRedis(idAccount);
				if (accessToken) {
					config.headers['Authorization'] = `Bearer ${accessToken}`;
					return config;
				}
				accessToken = await newAccessToken(idAccount);
				Redis.client.setex("GOOGLE_ACCESS_TOKEN_"+ idAccount,60 * 59, accessToken);
				// Log auth
				config.headers['Authorization'] = `Bearer ${accessToken}`;
			} catch (error) {
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
		return Promise.reject(error);
	});
}
