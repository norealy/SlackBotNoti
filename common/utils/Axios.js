const axios = require('axios');
<<<<<<< HEAD
const config = (function(){
=======
const config = () => {
>>>>>>> e801f9d (NEOS_VN_BNT-3 update setup knex)
	//RESPONSE
	axios.interceptors.response.use(
		function (response) {
			return response;
		},
		async function (error) {
			return Promise.reject(error.response);
		}
	)
<<<<<<< HEAD
})();
=======
}
>>>>>>> e801f9d (NEOS_VN_BNT-3 update setup knex)
module.exports = config;
