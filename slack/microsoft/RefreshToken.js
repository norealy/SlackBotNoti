const Env = require('../../utils/Env');
const qs = require("qs");
const axios = require('axios');
const MicrosoftAccount = require('../../models/MicrosoftAccount');
const Redis = require('../../utils/redis/index');

function getRefreshToken(idAccount) {
  return new Promise((resolve, reject) => {
    MicrosoftAccount.query().findById(idAccount)
      .then((data) => {
        if (!data) {
          return reject(null);
        } else {
          return resolve(data.refresh_token);
        }
      })
      .catch((err) => reject(null))
  })
}

const createAccessToken = async (idAccount) => {
  const refreshToken = await getRefreshToken(idAccount);
  console.log("===========refreshToken============");
  const data = {
    "grant_type": "refresh_token",
    "refresh_token": refreshToken,
    "client_id": Env.resourceServerGet("AZURE_ID"),
    "client_secret": Env.resourceServerGet("AZURE_SECRET"),
    "scope": Env.resourceServerGet("SCOPE")
  }
  const options = {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify(data),
    url:
      Env.resourceServerGet("API_URL_AUTH") +
      Env.resourceServerGet("API_TOKEN"),
  };

  const result = await axios(options);
  // Redis.client.setex(idAccount, 60*59 ,result.data.access_token);
  return result.data.access_token;
}

const updateRefresh = (idAccount, refreshToken) => {
  return MicrosoftAccount.query()
    .patch({ refresh_token: refreshToken })
    .findById(idAccount);
}

module.exports = {
  createAccessToken,
  updateRefresh
}
