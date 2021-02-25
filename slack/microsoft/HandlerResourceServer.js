const Env = require('../../utils/Env');
const axios = require('axios');
const Redis = require('../../utils/redis/index');
const ChannelsCalendar = require('../../models/ChannelsCalendar');
const _ = require('lodash');
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
  let showEvent = JSON.stringify(messageFormat);
  showEvent = JSON.parse(showEvent);
  const tokenBot = Env.chatServiceGet("BOT_TOKEN");
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenBot}`,
    },
    data: {
      channel: idChan,
      blocks: showEvent.blocks,
    },
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_POST_MESSAGE"),
  };
  options.data.blocks[1].text.text = `*${event.subject}*`;
  options.data.blocks[3].fields[0].text = event.start.dateTime.split('T')[0];
  options.data.blocks[3].fields[1].text = event.start.dateTime.split('T')[1].split('.0000000')[0] +
    "-" + event.end.dateTime.split('T')[1].split('.0000000')[0];
  if (event.locations[0]) {
    options.data.blocks[4].text.text = event.locations[0].displayName;
  }
  if (event.bodyPreview) {
    options.data.blocks[5].text.text = `_${event.bodyPreview}_`;
  }
  if (event.recurrence) {
    options.data.blocks[2].text.text = "Repeat : " + event.recurrence.pattern.type;
  }
  if (event.isAllDay) {
    options.data.blocks[3].fields[1].text = event.end.dateTime.split('T')[0];
  }
  if (!event.bodyPreview) {
    options.data.blocks.splice(5, 1);
  }
  if (!event.locations[0]) {
    options.data.blocks.splice(4, 1);
  }
  if (!event.recurrence) {
    options.data.blocks.splice(2, 1);
  }
  if (lv === 2) {
    options.data.blocks[0].elements[1].text = "*Event calendar. Type: Updated*"
  } else if (lv === 3) {
    options.data.blocks[0].elements[1].text = "*Event calendar. Type: Deleted*"
  }
  return axios(options);
}
/**
 * Kiem tra event da gui cach day 5s
 * @param {string} idEvent
 * @param {string} idUser
 */
const checkEventExist = async (idEvent, idUser) => {
  let accessToken = await getValueRedis(idUser);
  let result = await getEvent(idUser, idEvent, accessToken);
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
  Promise.all(arrChenCal.map(item => sendMessage(1, event, item.id_channel, showEvent)))
    .then(function () {
      console.log("Create ok")
    })
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
  Promise.all(arrChenCal.map(item => sendMessage(2, event, item.id_channel, showEvent)))
    .then(function () {
      console.log("Update ok")
    })
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
  Promise.all(arrChenCal.map(item => sendMessage(3, event, item.id_channel, showEvent)))
    .then(function () {
      console.log("Delete ok")
    })
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
