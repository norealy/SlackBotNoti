const axios = require('axios');

module.exports = () => {
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
