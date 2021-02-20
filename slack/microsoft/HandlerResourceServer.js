const Env = require('../../utils/Env');
const axios = require('axios');
const Redis = require('../../utils/redis/index');
const ChannelsCalendar = require('../../models/ChannelsCalendar');
const _ = require('lodash');


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

const sendMessage = async (lv, event, idChan, messageFormat) => {
  const tokenBot = Env.chatServiceGet("BOT_TOKEN");
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenBot}`,
    },
    data: {
      channel: idChan,
      blocks: messageFormat.blocks,
    },
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_POST_MESSAGE"),
  };
  options.data.blocks[0].fields[0].text = event.subject;
  options.data.blocks[0].fields[1].text = event.start.dateTime.split('T')[1].split('.0000000')[0] + "-";
  options.data.blocks[0].fields[1].text += event.end.dateTime.split('T')[1].split('.0000000')[0];
  if (event.locations[0]) {
    options.data.blocks[0].fields[2].text = event.locations[0].displayName
  } else {
    options.data.blocks[0].fields[2].text = "_______";
  }
  options.data.blocks[0].fields[3].text = event.start.dateTime.split('T')[0];
  options.data.blocks[0].text = { "type": "mrkdwn", "text": "*Create Event*" };
  if (lv === 2) {
    options.data.blocks[0].text.text = "*Update Event*"
  } else if (lv === 3) {
    options.data.blocks[0].text.text = "*Delete Event*"
  }
  return axios(options)
}


const checkEventExist = async ( idEvent ,idUser) => {

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
    console.log("checked:", checked);
    if (checked) {
      return false
    }
  }
  Redis.client.setex(event.id, 5, JSON.stringify(event));
  return event;
}


const handlerCreated = async (idSub, resource, showEvent) => {
  console.log("====================CREATED====================");
  const idEvent = resource.split('/')[3];
  const idUser = resource.split('/')[1];
  const idCal = await getValueRedis(idSub);
  const event = await checkEventExist( idEvent , idUser);
  if (!event || !idCal) return null;
  const arrChenCal = await ChannelsCalendar.query().where({ id_calendar: idCal });
  Promise.all(arrChenCal.map(item => sendMessage(1, event, item.id_channel, showEvent)))
    .then(function () {
      console.log("Create ok")
    })
}

const handlerUpdated = async (idSub, resource, showEvent) => {
  console.log("====================Update====================");
  const idEvent = resource.split('/')[3];
  const idUser = resource.split('/')[1];
  const idCal = await getValueRedis(idSub);
  const event = await checkEventExist( idEvent , idUser);
  if (!event || !idCal) return null;
  const arrChenCal = await ChannelsCalendar.query().where({ id_calendar: idCal });
  Promise.all(arrChenCal.map(item => sendMessage(2, event, item.id_channel, showEvent)))
    .then(function () {
      console.log("Update ok")
    })
}

const handlerDeleted = async (idSub, resource, showEvent) => {
  console.log("====================DELETE====================");
  const idEvent = resource.split('/')[3];
  const idUser = resource.split('/')[1];
  const idCal = await getValueRedis(idSub);
  const event = await checkEventExist( idEvent , idUser);
  if (!event || !idCal) return null;
  const arrChenCal = await ChannelsCalendar.query().where({ id_calendar: idCal });
  Promise.all(arrChenCal.map(item => sendMessage(3, event, item.id_channel, showEvent)))
    .then(function () {
      console.log("Delete ok")
    })
}

module.exports = {
  handlerCreated,
  handlerUpdated,
  handlerDeleted
}
