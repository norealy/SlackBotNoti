const qs = require("qs");
const axios = require("axios");
const Env = require("../../utils/Env");
const MicrosoftAccount = require("../../models/MicrosoftAccount");
const MicrosoftCalendar = require("../../models/MicrosoftCalendar");
const MicrosoftAccountCalendar = require("../../models/MicrosoftAccountCalendar");
const Channels = require("../../models/Channels");
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const Redis = require('../../utils/redis/index');
const { createSubcription } = require('./Subcription');

/**
 * Lay tai nguyen tokens
 * @param {string} code
 * @param {string} state
 * @returns {Promise}
 */
const getToken = (code, state) => {
  return new Promise((resolve, reject) => {
    let data = {
      client_id: Env.resourceServerGOF("AZURE_ID"),
      scope: Env.resourceServerGOF("SCOPE"),
      code,
      redirect_uri: Env.resourceServerGOF("AZURE_REDIRECT"),
      grant_type: "authorization_code",
      client_secret: Env.resourceServerGOF("AZURE_SECRET"),
      response_mode: "form_post",
      state,
    };
    const options = {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: qs.stringify(data),
      url:
        Env.resourceServerGOF("API_URL_AUTH") +
        Env.resourceServerGOF("API_TOKEN"),
    };
    axios(options)
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err)
      });
  });
};

/**
 * Lay tai nguyen  danh sach calendar
 * @param {string} idAccount
 * @returns {Promise}
 */
const getListCalendar = (idAccount) => {
  const options = {
    method: "GET",
    headers: { 'X-Microsoft-AccountId': idAccount },
    url:
      Env.resourceServerGOF("GRAPH_URL") +
      Env.resourceServerGOF("GRAPH_CALENDARS"),
  };
  return new Promise((resolve, reject) => {
    axios(options)
      .then((res) => resolve(res.data))
      .catch((error) => reject(error));
  });
};

/**
 * Lay tai nguyen thong tin timeZOne
 * @param {string} accessTokenAzure
 * @returns {Promise}
 */
const getTimeZoneOutlook = (accessTokenAzure) => {
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${accessTokenAzure}` },
    url:
      Env.resourceServerGOF("GRAPH_URL") + Env.resourceServerGOF("GRAPH_MAILBOX_SETTINGS"),
  };
  return axios(options);
};

/**
 * Lay suppport timezone
 * @param {string} accessTokenAzure
 * @returns {Promise}
 */
const getTimeZoneSupport = (accessTokenAzure) => {
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${accessTokenAzure}` },
    url: Env.resourceServerGOF("GRAPH_URL") + Env.resourceServerGOF("GRAPH_TIMEZONE_SUPPORT"),
  };
  return axios(options);
};


/**
 * Lay tai nguyen thong tin ve user Profile
 * @param {string} accessTokenAzure
 * @returns {Promise}
 */
const getProfileUser = (accessTokenAzure) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${accessTokenAzure}` },
      url:
        Env.resourceServerGOF("GRAPH_URL") +
        Env.resourceServerGOF("GRAPH_USER"),
    };
    axios(options)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
};

/**
 * Luu thong tin vao database
 * @param {object} profileUser
 * @param {string} refreshTokenAzure
 * @param {string} accessTokenAzure
 * @returns {Promise}
 */
const saveUserProfile = async (profileUser, refreshTokenAzure, accessTokenAzure) => {
  const result = await getTimeZoneOutlook(accessTokenAzure);
  const resultArr = await getTimeZoneSupport(accessTokenAzure);
  const timeZone = resultArr.data.value.find((element) => element.alias === result.data.timeZone);
  const account = {
    id: profileUser.id,
    name: profileUser.displayName,
    refresh_token: refreshTokenAzure,
    timezone: timeZone.displayName.split('UTC')[1].split(')')[0],
    created_at: null,
    updated_at: null,
  };
  const data = await MicrosoftAccount.query().findById(account.id);
  return new Promise((resolve, reject) => {
    if (!data) {
      MicrosoftAccount.query()
        .insert(account)
        .then((res) => {
          Redis.client.setex(res.id, 60 * 59, accessTokenAzure);
          return resolve(res)
        })
        .catch((err) => reject(err));
    }
    resolve();
  });
};

/**
 *  Xu ly dua array calendar ve dang
 * @param {Array} allCalendar
 * @returns {Array} array Calendar
 */
const customFormatArrayCal = (allCalendar) => {
  const arrayCal = [];
  allCalendar.forEach((item) => {
    const cal = {
      id: item.id,
      name: item.name,
      address_owner: item.owner.address,
      created_at: null,
    };
    arrayCal.push(cal);
  });
  return arrayCal;
};

/**
 *  Luu array calendar vao database
 * @param {string} allCalendar
 * @param {string} idAccount
 * @returns {Promise}
 */
const saveListCalendar = async (allCalendar, idAccount) => {
  const arrayCal = customFormatArrayCal(allCalendar);
  if (!arrayCal) return null;
  for (let i = 0; i < arrayCal.length; i++) {
    const item = arrayCal[i];
    const data = await MicrosoftCalendar.query().findOne({
      id: item.id,
      address_owner: item.address_owner,
    });
    if (!data) {
      await MicrosoftCalendar.query().insert(item);
      const resultSub = await createSubcription(item.id, idAccount);
      Redis.client.set(resultSub.data.id, item.id);
    }
  }
  return null;
};

/**
 * Lay ra thong tin ve channel thong qua id channel
 * @param {string} idChannel
 * @returns {Promise}
 */
const getNameChannel = (idChannel) => {
  let url = Env.chatServiceGOF('API_URL');
  url += Env.chatServiceGOF('API_CHANNEL_INFO');
  url += idChannel;
  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: {
      channel: idChannel,
    },
    url,
  };
  return axios(options);
};

/**
 * Luu thong tin channel vao database
 * @param {string} idChannel
 * @returns {Promise}
 */
const saveInfoChannel = async (idChannel) => {
  const promise = new Promise((resolve) => resolve());
  const dataChannel = await getNameChannel(idChannel);
  if (!dataChannel) return promise;
  const result = await Channels.query().findById(idChannel);
  if (result) return promise;
  const channel = {
    id: idChannel,
    name: dataChannel.data.channel.name,
    created_at: null,
  };
  return Channels.query().insert(channel);
};

/**
 * Đưa về định dạng giống với bảng microsoft_account_calendar
 * @param {string} idAccount
 * @param {Array} arrCalendar
 * @returns {Array}
 */
const customFormatMicrosoftAccountCalendar = (idAccount, arrCalendar) => {
  const arrayAccCal = [];
  arrCalendar.forEach((item) => {
    const msAccCal = {
      id_calendar: item.id,
      id_account: idAccount,
      created_at: null,
    };
    arrayAccCal.push(msAccCal);
  });
  return arrayAccCal;
};

/**
 * Luu thong tin MicrosoftAccountCalendar vao database
 * @param {string} idAccount
 * @param {Array} arrCalendar
 * @returns {Promise}
 */
const saveMicrosoftAccountCalendar = async (idAccount, arrCalendar) => {
  const arrayAccCal = customFormatMicrosoftAccountCalendar(
    idAccount,
    arrCalendar
  );
  if (!arrayAccCal) return null;
  for (let i = 0; i < arrayAccCal.length; i++) {
    const item = arrayAccCal[i];
    const data = await MicrosoftAccountCalendar.query().findOne({
      id_account: idAccount,
      id_calendar: item.id_calendar,
    });
    if (!data) {
      await MicrosoftAccountCalendar.query().insert(item);
    }
  }
  return null;
};

/**
 * Đưa về định dạng giống với bảng channels_calendar
 * @param {string} idChannel
 * @param {Array} arrCalendar
 * @returns {Array}
 */
const customFormatChannelsCalendar = (idChannel, arrCalendar) => {
  const arrayChannelCal = [];
  arrCalendar.forEach((item) => {
    const msChenCal = {
      id_calendar: item.id,
      id_channel: idChannel,
      watch: true,
      created_at: null,
      updated_at: null,
    };
    arrayChannelCal.push(msChenCal);
  });
  return arrayChannelCal;
};

/**
 * Luu thong tin saveChannelsCalendar vao database
 * @param {string} idChannel
 * @param {Array} arrCalendar
 * @returns {Promise}
 */
const saveChannelsCalendar = async (idChannel, arrCalendar) => {
  const arrayChanCal = customFormatChannelsCalendar(idChannel, arrCalendar);
  if (!arrayChanCal) return null;
  arrayChanCal.forEach(async (item) => {
    const data = await ChannelsCalendar.query().findOne({
      id_channel: idChannel,
      id_calendar: item.id_calendar,
    });
    if (!data) {
      await ChannelsCalendar.query().insert(item);
    }
  });
};


module.exports = {
  getToken,
  getListCalendar,
  getProfileUser,
  saveUserProfile,
  saveListCalendar,
  saveInfoChannel,
  saveMicrosoftAccountCalendar,
  saveChannelsCalendar,
};
