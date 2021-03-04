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
        const {items = []} = result.data;
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
 * @param {string} idChanel
 * @param {array} showEvent
 * @param {object} event
 * @returns {Promise}
 */
const sendWatchNoti = (idChanel, showEvent, event) => {
  const tokenBot = Env.chatServiceGet("BOT_TOKEN");
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenBot}`,
    },
    data: {
      channel: idChanel,
      blocks: [...showEvent],
    },
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_POST_MESSAGE"),
  };
  options.data.blocks[0].elements[1].text = "*CALENDAR GOOGLE*";
  if (event.recurrence) {
    options.data.blocks[0].elements[3].text = `*Repeat: ${event.recurrence[0].split('=')[1]}*`;
  }
  options.data.blocks[1].fields[0].text = `*${event.summary}*`;
  options.data.blocks[1].fields[1].text = `Calendar: ${event.organizer.email}`;
  if (event.organizer.displayName) {
    options.data.blocks[1].fields[1].text = `Calendar: ${event.organizer.displayName}`;
  }
  if (event.status === 'cancelled') {
    options.data.blocks[0].elements[2].text = "*Type: Delete Event*";
    options.data.blocks.length = 2;
    options.data.blocks.push({"type": "divider"});
    return Axios(options);
  }
  const created = event.created.split('T')[1].split('.')[0].split('Z')[0];
  const updated = event.updated.split('T')[1].split('.')[0].split('Z')[0];
 // if (created !== updated) options.data.blocks[0].elements[1].text = "*Type: Update Event*";

  if (event.start.date && event.end.date) {
    const dateStart = moment(event.start.date).utc(true).format("DD-MM-YYYY");
    const dateEnd = moment(event.end.date).utc(true).format("DD-MM-YYYY");
    options.data.blocks[2].fields[0].text = `Start: ${dateStart}`;
    options.data.blocks[2].fields[1].text = `End: ${dateEnd}`;
  } else if (event.start.dateTime && event.end.dateTime) {
    const datetimeStart = moment(event.start.dateTime).utc(true).tz(event.timezone);
    const datetimeEnd = moment(event.end.dateTime).utc(true).tz(event.timezone);
    options.data.blocks[2].fields[0].text = datetimeStart.format("DD-MM-YYYY");
    options.data.blocks[2].fields[1].text = datetimeStart.format("hh:ss:mm") +
      "-" + datetimeEnd.format("hh:ss:mm");
  }

  if (event.location) options.data.blocks[3].text.text = event.location;
  if (event.description) options.data.blocks[4].text.text = event.description;

  if (!event.description) options.data.blocks.splice(4, 1);
  if (!event.location) options.data.blocks.splice(3, 1);
  // if (event.status === "cancelled") {
  //   console.log("delete")
  //   options.data.blocks[0].elements[1].text = "*Delete Event*"
  // }
   if (created === updated && event.status === "confirmed") {
     options.data.blocks[0].elements[1].text = "*CALENDAR GOOGLE*";
     options.data.blocks[0].elements[2].text = "*Type: Create Event*";
  } else if (created != updated && event.status === "confirmed") {
     options.data.blocks[0].elements[1].text = "*CALENDAR GOOGLE*";
     options.data.blocks[0].elements[2].text = "*Type: Update  Event*";

  }


  return Axios(options)

}

module.exports = {
  getEventUpdate,
  sendWatchNoti,
  getEvent
}
