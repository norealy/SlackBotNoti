const Env = require('../../utils/Env');
const axios = require('axios');

/**
 * Sum date
 * @param {interger} days
 * @returns {Promise}
 */
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * register subcription
 * @param {string} idCalendar
 * @param {string} idAccount
 * @returns {Promise}
 */
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
/**
 * update Subcription
 * @param {string} idSub
 * @param {string} idAccount
 * @returns {Promise}
 */
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
