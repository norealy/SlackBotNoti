const axios = require('axios');
const config = () => {
	//RESPONSE
	axios.interceptors.response.use(
		function (response) {
			return response;
		},
		async function (error) {
			return Promise.reject(error.response);
		}
	)
}
module.exports = config;
