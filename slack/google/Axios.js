const Axios = require('axios');
const Env = require('../../utils/Env');
const {newAccessToken} = require('./RefreshToken');

module.exports = function (server) {
  // Handler REQUEST
  Axios.interceptors.request.use(async function (config) {
    const {url, headers} = config;
    const {Authorization = null} = config.headers;
    const regex = new RegExp(`^${Env.resourceServerGet("API_URL")}`);
    const idAccount = headers['X-Google-AccountId'];
    if (url && regex.test(url) && !Authorization && idAccount) {
      try {
        let accessToken = await server.getAccessTokenRedis(idAccount);
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
          return config;
        }
        accessToken = await newAccessToken(idAccount);
        server.setAccessTokenRedis(idAccount, accessToken, 60 * 59);
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
