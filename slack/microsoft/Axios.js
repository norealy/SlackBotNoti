const Axios = require('axios');
const Env = require('../../utils/Env');
const {createAccessToken} = require('./RefreshToken');

module.exports = function (server) {
  // Handler REQUEST
  Axios.interceptors.request.use(async function (config) {
    const {url, headers} = config;
    const {Authorization = null} = config.headers;
    if (url && url.split('.com')[0] === Env.resourceServerGet("GRAPH_URL").split('.com')[0] && !Authorization) {
      const idAccount = headers['X-Microsoft-AccountId'];
      try {
        let accessToken = await server.getAccessTokenRedis(idAccount);
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
          return config;
        }
        accessToken = await createAccessToken(idAccount);
        server.setAccessTokenRedis(idAccount, accessToken);
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return config;
  }, function (error) {
    // chưa xử lý lỗi 401
    // response.status: 401,
    // const {response} = error;
    // if(response && response.status && response.status === 401){
    //
    // }
    return Promise.reject(error);
  });

  //  Handler RESPONSE
  Axios.interceptors.response.use(function (response) {
    return response;
  }, async function (error) {
    return Promise.reject(error);
  });
}
