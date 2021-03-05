const Env = require('../../utils/Env');
const axios = require('axios');
const Redis = require('../../utils/redis/index');
const ChannelsCalendar = require('../../models/ChannelsCalendar');
const MicrosoftAccount = require('../../models/MicrosoftAccount');
const moment = require('moment');
const _ = require('lodash');
const MicrosoftCalendar = require('../../models/MicrosoftCalendar');
/**
 *  Lay event
 * @param {string} idUser
 * @param {string} idEvent
 * @returns {Promise}
 */
const getEvent = (idUser, idEvent) => {
  const options = {
    method: 'GET',
    headers: {
      'X-Microsoft-AccountId': idUser
    },
    url: `${Env.resourceServerGOF("GRAPH_URL")}${Env.resourceServerGOF("GRAPH_MY_EVENT")}/${idEvent}`
  };
  return new Promise((resolve, reject) => {
    axios(options).then((data) => {
      return resolve(data);
    }).catch((error) => {
      return resolve(error.response);
      // return reject(error);
    });
  })
}
/**
 *
 * @param {string} key
 * @returns {*} Values
 */
function getValueRedis(key) {
  return new Promise((resolve, reject) => {
    Redis.client.get(key, (err, reply) => {
      if (err) reject(null);
      resolve(reply);
    });
  })
}

/**
 * Gui tin nhan ve channel
 * @param {number} lv
 * @param {object} event
 * @param {string} idChan
 * @param {json} messageFormat
 */
const sendMessage = async (lv, event, idChan, messageFormat) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`,
    },
    data: {
      channel: idChan,
      blocks: [...messageFormat.blocks],
    },
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_POST_MESSAGE"),
  };
  options.data.blocks[0].elements[0].image_url = 'https://apis.iceteait.com/public/icon/MICROSOFT.png';
  options.data.blocks[1].fields[0].text = `*${event.subject}*`;
  options.data.blocks[1].fields[1].text = `*Calendar: ${event.nameCalendar}*`;
  const datetimeStart = moment(event.start.dateTime).utc(true).utcOffset(event.timezone);
  const datetimeEnd = moment(event.end.dateTime).utc(true).utcOffset(event.timezone);
  options.data.blocks[2].fields[0].text = datetimeStart.format("DD-MM-YYYY");
  options.data.blocks[2].fields[1].text = datetimeStart.format("hh:mm") +
    "-" + datetimeEnd.format("hh:mm");

  if (event.locations.length > 0) {
    options.data.blocks[3].text.text = event.locations.map(value => value.displayName).join(", ");
  }
  if (event.bodyPreview) {
    options.data.blocks[4].text.text = `_${event.bodyPreview}_`;
  }
  if (event.isAllDay) {
    options.data.blocks[2].fields[1].text = datetimeEnd.format("DD-MM-YYYY");
  }
  if (!event.bodyPreview) {
    options.data.blocks.splice(4, 1);
  }
  if (!event.locations[0]) {
    options.data.blocks.splice(3, 1);
  }
  if (lv === 2) {
    options.data.blocks[0].elements[2].text = "*Type: Updated event*"
  } else if (lv === 3) {
    options.data.blocks[0].elements[2].text = "*Type: Deleted event*"
  }
  return axios(options);
}
/**
 * Kiem tra event da gui cach day 5s
 * @param {string} idEvent
 * @param {string} idUser
 */
const checkEventExist = async (idEvent, idUser) => {
  let result = await getEvent(idUser, idEvent);
  const { status = null } = result;
  if (status === 404) {
    const event = await getValueRedis(idEvent);
    if (!event) return false;
    result.data = event;
  }
  const event = result.data;
  const eventRedis = await getValueRedis(event.id);
  if (eventRedis) {
    const data = JSON.parse(eventRedis);
    const checked = _.isEqual(event, data);
    if (checked) {
      return false
    }
  }
  Redis.client.setex(event.id, 5, JSON.stringify(event));
  return event;
}
/**
 *
 * @param {string} idSub
 * @param {object} resource
 * @param {json} showEvent
 */
const handlerCreated = async (idSub, resource, showEvent) => {
  const idEvent = resource.split('/')[3];
  const idUser = resource.split('/')[1];
  const idCal = await getValueRedis(idSub);
  const event = await checkEventExist(idEvent, idUser);
  if (!event || !idCal) return null;
  const arrChenCal = await ChannelsCalendar.query().where({ id_calendar: idCal, watch: true });
  const account = await MicrosoftAccount.query().findById(idUser);
  event.timezone = account.timezone;
  const calendar = await MicrosoftCalendar.query().findById(idCal);
  event.nameCalendar = calendar.name;
  Promise.all(arrChenCal.map(item => sendMessage(1, event, item.id_channel, showEvent)));
}
/**
 *
 * @param {string} idSub
 * @param {object} resource
 * @param {json} showEvent
 */
const handlerUpdated = async (idSub, resource, showEvent) => {
  const idEvent = resource.split('/')[3];
  const idUser = resource.split('/')[1];
  await sleep(1500);
  const idCal = await getValueRedis(idSub);
  const event = await checkEventExist(idEvent, idUser);
  if (!event || !idCal) return null;
  const arrChenCal = await ChannelsCalendar.query().where({ id_calendar: idCal, watch: true });
  const account = await MicrosoftAccount.query().findById(idUser);
  event.timezone = account.timezone;
  const calendar = await MicrosoftCalendar.query().findById(idCal);
  event.nameCalendar = calendar.name;
  Promise.all(arrChenCal.map(item => sendMessage(2, event, item.id_channel, showEvent)));
}
/**
 *
 * @param {string} idSub
 * @param {object} resource
 * @param {json} showEvent
 */
const handlerDeleted = async (idSub, resource, showEvent) => {
  const idEvent = resource.split('/')[3];
  const idUser = resource.split('/')[1];
  const idCal = await getValueRedis(idSub);
  const event = await checkEventExist(idEvent, idUser);
  if (!event || !idCal) return null;
  const arrChenCal = await ChannelsCalendar.query().where({ id_calendar: idCal, watch: true });
  const account = await MicrosoftAccount.query().findById(idUser);
  event.timezone = account.timezone;
  const calendar = await MicrosoftCalendar.query().findById(idCal);
  event.nameCalendar = calendar.name;
  Promise.all(arrChenCal.map(item => sendMessage(3, event, item.id_channel, showEvent)));
}
/**
 * sleep
 * @param {number} ms
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = {
  handlerCreated,
  handlerUpdated,
  handlerDeleted
}
