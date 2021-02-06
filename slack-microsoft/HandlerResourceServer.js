const Axios = require("axios");
const EncodeJws = require("./Jws");
const ENV = require('../utils/Env');

const redirectMicrosoft = (idChannel, idUser) => {
	try {
    const stateAzure = EncodeJws.createJWS(idChannel, idUser);
    let urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${ENV.resourceServerGet("AZURE_ID")}&response_type=code&redirect_uri=${ENV.resourceServerGet("AZURE_REDIRECT")}&response_mode=query&scope=${scopeAzure}&state=${stateAzure}`;
		return urlRequestAuthor;
	} catch (error) {
		return "error";
	}
};

const sendMessageLogin = (event,viewLoginResource,tokenBot) => {
return new Promise((resolve,reject)=>{
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenBot}`,
    },
    data: {
      channel: event.channel,
      blocks: viewLoginResource,
    },
    url: "https://slack.com/api/chat.postMessage",
  };
  options.data.blocks[3].elements[1].url = redirectMicrosoft(
    event.channel,
    event.inviter
  );
  Axios(options)
  .then((result) => {
    return resolve(result)
  }).catch((err) => {
    return reject(err)
  });;
})

};

module.exports = {
  sendMessageLogin
}
