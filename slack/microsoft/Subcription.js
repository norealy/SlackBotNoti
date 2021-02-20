const Env = require('../../utils/Env');
const axios = require('axios');

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

const createSubcription = (idCalendar, idAccount) => {
  let date = new Date();
  const data = {
    "changeType": "created,updated,deleted",
    "notificationUrl": Env.resourceServerGOF("SUB_NOTIFICATION_URL"),
    "resource": `me/calendars/${idCalendar}/events`,
    "expirationDateTime": date.addDays(2),
    "latestSupportedTlsVersion": "v1_2"
  }
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-Microsoft-AccountId': idAccount
    },
    data: JSON.stringify(data),
    url:
      Env.resourceServerGOF("GRAPH_URL") +
      Env.resourceServerGOF("GRAPH_SUB"),
  };
  return axios(options);
}

const updateSubcription = (idSub, idAccount) => {
  let date = new Date();
  const data = {
    "expirationDateTime": date.addDays(2)
  }
  const options = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      'X-Microsoft-AccountId': idAccount
    },
    data: JSON.stringify(data),
    url:
      Env.resourceServerGOF("GRAPH_URL") +
      Env.resourceServerGOF("GRAPH_SUB") +
      idSub,
  };
  return axios(options);
}

module.exports = {
  createSubcription,
  updateSubcription
}
