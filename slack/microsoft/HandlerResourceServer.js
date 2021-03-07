const Env = require('../../utils/Env');
const axios = require('axios');
const Redis = require('../../utils/redis/index');
const moment = require('moment');
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
  return axios(options);
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
const handlerDatas = (lv, channels, event, view) => {
  const blocks = [...view.blocks];
  blocks[0].elements[0].image_url = 'https://apis.iceteait.com/public/icon/MICROSOFT.png';
  blocks[1].fields[0].text = `*${event.subject}*`;
  blocks[1].fields[1].text = `*Calendar: ${event.nameCalendar}*`;
  const datetimeStart = moment(event.start.dateTime).utc(true).utcOffset(event.timezone);
  const datetimeEnd = moment(event.end.dateTime).utc(true).utcOffset(event.timezone);
  blocks[2].fields[0].text = datetimeStart.format("DD-MM-YYYY");
  blocks[2].fields[1].text = datetimeStart.format("hh:mm") +
    " - " + datetimeEnd.format("hh:mm");

  if (event.locations.length > 0) {
    blocks[3].text.text = event.locations.map(value => value.displayName).join(", ");
  }
  if (event.bodyPreview) {
    blocks[4].text.text = `_${event.bodyPreview}_`;
  }
  if (event.isAllDay) {
    blocks[2].fields[1].text = datetimeEnd.format("DD-MM-YYYY");
  }
  if (!event.bodyPreview) {
    blocks.splice(4, 1);
  }
  if (!event.locations[0]) {
    blocks.splice(3, 1);
  }
  if (lv === 2) {
    blocks[0].elements[2].text = "*Type: Updated event*"
  } else if (lv === 3) {
    blocks[0].elements[2].text = "*Type: Deleted event*"
  }else{
    blocks[0].elements[2].text = "*Type: Create event*"
  }
  const datas = [];
  channels.forEach(item => {
    datas.push({
      channel: item.id_channel,
      blocks,
    })
;  });
  return datas;
}

module.exports = {
  getEvent,
  getValueRedis,
  handlerDatas
}
