const Env = require('../../utils/Env');
const Axios = require('axios');
const moment = require('moment-timezone');

/**
 * Get google calendar event updates
 * @param {object} headers
 * @param {string} idAccount
 * @return {Promise}
 */
const getEventUpdate = (headers, idAccount) => {
  return new Promise((resolve, reject) => {
    const dateNow = new Date();
    const options = {
      url: headers['x-goog-resource-uri'],
      method: 'GET',
      headers: {'X-Google-AccountId': idAccount},
      params: {
        updatedMin: new Date(dateNow - (5 * 60 * 1000)).toISOString(),
      },
    };
    Axios(options)
      .then(result => {
        const {items} = result.data;
        const legItem = items.length;
        if (legItem === 0) resolve(null);
        resolve(items[legItem - 1])
      })
      .catch(err => {
        reject(err)
      });
  });
};

/**
 * Get google calendar event updates
 * @param {string} idCalendar
 * @param {string} idEvent
 * @param {string} idAccount
 * @return {Promise}
 */
const getEvent = (idCalendar, idEvent, idAccount) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: Env.resourceServerGOF("API_URL"),
      method: 'GET',
      headers: {'X-Google-AccountId': idAccount},
    };
    options.url += Env.resourceServerGOF("API_CALENDAR");
    options.url += `/${idCalendar}`;
    options.url += `/events/${idEvent}`;
    Axios(options)
      .then(result => resolve(result.data))
      .catch(err => reject(err));
  });
};

/**
 *
 * @param {array} channels
 * @param {array} showEvent
 * @param {object} event
 * @returns {array}
 */
const makeData = (channels, showEvent, event) => {
  const blocks = [...showEvent];
  blocks[0].elements[0].image_url = `${Env.serverGOF("URL_PUBLIC")}/icon/GOOGLE_CALENDAR.png`;
  blocks[0].elements[1].text = "*CALENDAR GOOGLE*";
  if (event.recurrence) {
    blocks[0].elements[3].text = `*Repeat: ${event.recurrence[0].split('=')[1]}*`;
  }
  blocks[1].fields[0].text = `*${event.summary}*`;
  blocks[1].fields[1].text = `Calendar: ${event.organizer.email}`;
  if(event.organizer.displayName){
    blocks[1].fields[1].text = `Calendar: ${event.organizer.displayName}`;
  }
  if(event.status === 'cancelled'){
    blocks[0].elements[2].text = "*Type: Delete Event*";
    blocks.length = 2;
    blocks.push({"type": "divider"});

    return Axios(options);
  }
  const created = event.created.split('T')[1].split('.')[0].split('Z')[0];
  const updated = event.updated.split('T')[1].split('.')[0].split('Z')[0];
 // if (created !== updated) blocks[0].elements[1].text = "*Type: Update Event*";

  if (event.start.date && event.end.date) {
    const dateStart = moment(event.start.date).utc(true).format("DD-MM-YYYY");
    const dateEnd = moment(event.end.date).utc(true).format("DD-MM-YYYY");
    blocks[2].fields[0].text = `Start: ${dateStart}`;
    blocks[2].fields[1].text = `End: ${dateEnd}`;
  } else if (event.start.dateTime && event.end.dateTime) {
    const datetimeStart = moment(event.start.dateTime).utc(true).tz(event.timezone);
    const datetimeEnd = moment(event.end.dateTime).utc(true).tz(event.timezone);
    blocks[2].fields[0].text = datetimeStart.format("DD-MM-YYYY");
    blocks[2].fields[1].text = datetimeStart.format("hh:ss:mm") +
      "-" + datetimeEnd.format("hh:ss:mm");
  }

  if (event.location) blocks[3].text.text = event.location;
  if (event.description) blocks[4].text.text = event.description;

  if (!event.description) blocks.splice(4, 1);
  if (!event.location) blocks.splice(3, 1);
   if (created === updated && event.status === "confirmed") {
     blocks[0].elements[1].text = "*CALENDAR GOOGLE*";
     blocks[0].elements[2].text = "*Type: Create Event*";
  } else if (created != updated && event.status === "confirmed") {
     blocks[0].elements[1].text = "*CALENDAR GOOGLE*";
     blocks[0].elements[2].text = "*Type: Update  Event*";
  }
   const data = [];
   channels.forEach(item => {
     data.push({channel: item.id_channel, blocks})
   })
  return data;
}

module.exports = {
  getEventUpdate,
  makeData,
  getEvent,
};
