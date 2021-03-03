const Axios = require("axios");
const Crypto = require("../../utils/Crypto");
const Env = require("../../utils/Env");
const moment = require('moment');
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const MicrosoftCalendar = require("../../models/MicrosoftCalendar");
const MicrosoftAccountCalendar = require("../../models/MicrosoftAccountCalendar");
const { getEvent } = require('./HandlerResourceServer');
const MicrosoftAccount = require("../../models/MicrosoftAccount");

/**
 * Show modals view add event to slack
 * @param {Object} body
 * @param {Object} template
 * @param {Array} timePicker
 * @returns {Promise}
 */
const handlerAddEvent = async (body, template, timePicker) => {
  const { trigger_id = null, channel_id = null } = body;
  const { addEvent } = template;
  addEvent.blocks[6].accessory.options = timePicker;
  addEvent.blocks[7].accessory.options = timePicker;
  let addView = JSON.stringify(addEvent);
  addView = JSON.parse(addView);
  const data = {
    trigger_id: trigger_id,
    view: addView,
  };
  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_VIEW_OPEN"),
  };
  const chanCals = await ChannelsCalendar.query().where({ id_channel: channel_id });
  for (let i = 0; i < chanCals.length; i++) {
    const item = chanCals[i];
    const calendar = await MicrosoftCalendar.query().findById(item.id_calendar);
    const selectCalendars = {
      "text": {
        "type": "plain_text",
        "text": calendar.name,
        "emoji": true
      },
      "value": calendar.id
    }
    options.data.view.blocks[1].accessory.options.push(selectCalendars);
  }
  addView.blocks.splice(5, 1);
  return Axios(options);
};

/**
 * handler Blocks Actions
 * @param {Object} payload
 * @param {Object} template
 * @returns {Promise}
 */
const handlerBlocksActions = (payload, template, timePicker) => {
  const { actions = null } = payload;
  switch (actions[0].action_id) {
    case "allday":
      return handlerAllDay(payload, template);
    case "overflow-action":
      return handlerOverflowAction(payload, template, timePicker);
  }
};
/**
 * Xu ly phan Overflow Action ( Sua hoac xoa su kien)
 * @param {Object} payload
 * @param {Object} template
 * @returns {Promise}
 */
const handlerOverflowAction = async (payload, template, timePicker) => {
  const value = payload.actions[0].selected_option.value.split('/');
  const blockId = payload.actions[0].block_id.split('/');

  if (value[0] === "edit") {
    const event = await getEvent(blockId[0], value[1]);
    event.data.idCalendar = blockId[1];
    payload.eventEditDT = event.data;
    payload.idAcc = blockId[0];
    return handlerEditEvent(payload, template, timePicker);
  }
  else if (value[0] === "delete") {
    return deleteEvent(blockId[0], value[1]);
  }
}
/**
 *
 * @param {string} value
 */
const checkAMorPM = (value) => {
  if (parseInt(value.split(":")[0]) < 12) {
    return value + "AM";
  }
  return value + "PM";
}
/**
 * Show modals view edit event to slack
 * @param {Object} payload
 * @param {Object} template
 * @param {Array} timePicker
 * @returns {Promise}
 */
const handlerEditEvent = async (payload, template, timePicker) => {
  try {
    const { trigger_id = null, channel = null, eventEditDT = null, idAcc = null } = payload;
  const channel_id = channel.id;
  const { editEvent } = template;
  editEvent.blocks[6].accessory.options = timePicker;
  editEvent.blocks[7].accessory.options = timePicker;
  let editView = JSON.stringify(editEvent);
  editView = JSON.parse(editView);
  editView.callback_id = `${editView.callback_id}/${eventEditDT.id}`;
  const chanCals = await ChannelsCalendar.query().where({ id_channel: channel_id });
  for (let i = 0, length = chanCals.length; i < length; i++) {
    const item = chanCals[i];
    const calendar = await MicrosoftCalendar.query().findById(item.id_calendar);
    const selectCalendars = {
      "text": {
        "type": "plain_text",
        "text": calendar.name,
        "emoji": true
      },
      "value": calendar.id
    }
    if (calendar.id === eventEditDT.idCalendar) {
      editView.blocks[1].accessory.initial_option = selectCalendars;
    }
    editView.blocks[1].accessory.options.push(selectCalendars);
  }
  editView.blocks[2].element.initial_value = eventEditDT.subject;

  if (eventEditDT.locations[0]) {
    editView.blocks[8].element.initial_value = eventEditDT.locations[0].displayName;
  }
  const account = await MicrosoftAccount.query().findById(idAcc);
  const datetimeStart = moment(eventEditDT.start.dateTime).utc(true).utcOffset(account.timezone).format("YYYY-MM-DD.hh:ss");
  const datetimeEnd = moment(eventEditDT.end.dateTime).utc(true).utcOffset(account.timezone).format("YYYY-MM-DD.hh:ss");
  editView.blocks[4].accessory.initial_date = datetimeStart.split('.')[0];

  if (eventEditDT.isAllDay) {
    editView.blocks.splice(6, 2);
    // editView.blocks.splice(5, 0, editEvent.blocks[5]);
    editView.blocks[5].accessory.initial_date = datetimeEnd.split('.')[0];
    editView.blocks[3].accessory.initial_options =
    [
      {
        "value": "true",
        "text": {
          "type": "plain_text",
          "text": "All day"
        }
      }
    ]

  } else {
    const initialOption = {
      "text": {
        "type": "plain_text",
        "text": checkAMorPM(datetimeStart.split('.')[1]),
        "emoji": true
      },
      "value": datetimeStart.split('.')[1]
    }
    const initialOption2 = {
      "text": {
        "type": "plain_text",
        "text": checkAMorPM(datetimeEnd.split('.')[1]),
        "emoji": true
      },
      "value": datetimeEnd.split('.')[1]
    }
    editView.blocks[6].accessory.initial_option = initialOption;
    editView.blocks[7].accessory.initial_option = initialOption2;
    editView.blocks.splice(5, 1);
  }
  const data = {
    trigger_id: trigger_id,
    view: editView,
  };

  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_VIEW_OPEN"),
  };
  console.log(JSON.stringify(options));
  await Axios(options);
  return;
  } catch (error) {
    console.log(error.data.response_metadata);
    return;
  }
};

/**
 * Thuc hien xoa event
 * @param {string} idAccount
 * @param {string} idEvent
 * @returns {Promise}
 */
const deleteEvent = (idAccount, idEvent) => {
  const options = {
    method: 'DELETE',
    headers: { 'X-Microsoft-AccountId': idAccount },
    url: `${Env.resourceServerGOF("GRAPH_URL")}${Env.resourceServerGOF("GRAPH_MY_EVENT")}/${idEvent}`
  };
  return Axios(options);
}

/**
 * handler Blocks Actions
 * @param {Object} payload
 * @param {Object} template
 * @returns {Promise}
 */
const handlerAllDay = async (payload, template) => {
  const { addEvent } = template;
  let addView = JSON.stringify(addEvent);
  addView = JSON.parse(addView)
  addView.blocks = payload.view.blocks;
  const { action_id = null, selected_options = null } = payload.actions[0];
  if (action_id === "allday" && selected_options.length === 0) {
    addView.blocks.splice(5, 1);
    addView.blocks.splice(5, 0, addEvent.blocks[7]);
    addView.blocks.splice(5, 0, addEvent.blocks[6]);
  } else if (action_id === "allday" && selected_options.length > 0) {
    addView.blocks.splice(5, 2);
    addView.blocks.splice(5, 0, addEvent.blocks[5]);
  }
  let data = {
    "view_id": payload["container"]["view_id"],
    "view": addView
  }
  const options = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_UPDATE")}`
  };
  return new Promise((resolve, reject) => {
    Axios(options).then((resp) => {
      console.log("RESP ; ",resp.data.response_metadata.messages)
      return resolve(resp);
    }).catch((err) => {
      return reject(err);
    });
  });
};

/**
 * Add day
 * @param {number} days
 * @returns {date}
 */
Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}
/**
 *
 * @param {string} type
 * @param {dateTime} datetime
 * @param {date} date
 */
const getRecurrence = (type, datetime, date) => {
  const dateStart = datetime;
  const recurrence = {
    "pattern": {
      "type": "daily",
      "interval": 1,
      "month": 0,
      "dayOfMonth": 0,
      "daysOfWeek": [
        "monday"
      ],
      "index": "first"
    },
    "range": {
      "type": "endDate",
      "startDate": dateStart,
      "endDate": dateStart
    }
  }
  datetime = datetime.split('-');
  var date = new Date(datetime[0], datetime[1], datetime[2]);
  switch (type) {
    case "daily":
      recurrence.pattern.type = "daily"
      let dateD = date.addDays(60);
      recurrence.range.endDate = dateD.getFullYear() + "-" + dateD.getMonth() + "-" + dateD.getDate()
      break;
    case "weekly":
      recurrence.pattern.type = "weekly";
      let dateW = date.addDays(150);
      recurrence.range.endDate = dateW.getFullYear() + "-" + dateW.getMonth() + "-" + dateW.getDate()
      break;
    case "absoluteMonthly":
      recurrence.pattern.type = "absoluteMonthly"
      recurrence.pattern.dayOfMonth = datetime[2];
      recurrence.pattern.firstDayOfWeek = "sunday";
      let dateM = date.addDays(365);
      recurrence.range.endDate = dateM.getFullYear() + "-" + dateM.getMonth() + "-" + dateM.getDate()
      break;
    default:
      break;
  }
  return recurrence;
}
/**
 * Submit event
 * @param {Object} payload
 * @returns {Promise}
 */
const HandlerSubmitEvent = async (payload) => {
  // "callback_id":"editEvent"
  const { values } = payload.view.state;
  const dateStart = values["select-date-start"]["datepicker-action-start"]["selected_date"]
  let dateEnd = values["select-date-start"]["datepicker-action-start"]["selected_date"]
  let timeStart = "00:00";
  let timeEnd = "00:00";
  if (values['select-date-end']) {
    dateEnd = values["select-date-end"]["datepicker-action-end"]["selected_date"]
  } else {
    timeStart = values["select-time-start"]["time-start-action"]["selected_option"].value
    timeEnd = values["select-time-end"]["time-end-action"]["selected_option"].value
  }
  let allDay = false;

  if (values['check_allday']['allday'].selected_options.length > 0) {
    allDay = true;
    timeStart = "00:00";
    timeEnd = "00:00";
    dateEnd = values["select-date-end"]["datepicker-action-end"]["selected_date"];
  }
  const event = {
    "reminderMinutesBeforeStart": values['select_before_notification']['static_select-action'].selected_option.value,
    "isReminderOn": true,
    "subject": values['input_title']['input-action'].value,
    "isAllDay": allDay,
    "start": {
      "dateTime": `${dateStart}T${timeStart}:00.0000000`,
      "timeZone": "UTC"
    },
    "end": {
      "dateTime": `${dateEnd}T${timeEnd}:00.0000000`,
      "timeZone": "UTC"
    },
    "location": {
      "displayName": values['input_location']['plain_text_input-action'].value,
    }
  }
  if (values.select_everyday['static_select-action']['selected_option'].value !== "nomal" && !allDay) {
    event.recurrence = getRecurrence(values.select_everyday['static_select-action']['selected_option'].value, dateStart);
  }
  const idCalendar = values["select_calendar"]["select_calendar"]["selected_option"].value;
  const accountCal = await MicrosoftAccountCalendar.query().findOne({ id_calendar: idCalendar });
  const options = {
    method: 'POST',
    headers: { "Content-Type": "application/json", 'X-Microsoft-AccountId': accountCal.id_account },
    data: JSON.stringify(event),
    url:
      Env.resourceServerGOF("GRAPH_URL") +
      Env.resourceServerGOF("GRAPH_CALENDARS") + `/${idCalendar}/events`
  };
  if (payload.view.callback_id && payload.view.callback_id.split('/')[0] === "editEvent") {
    const value = payload.view.callback_id.split('/');
    options.method = 'PATCH';
    options.url += "/" + value[1];
  }
  await Axios(options);
  const { trigger_id = null, view = null } = payload;
  const data = {
    "trigger_id": trigger_id,
    "view": view
  }
  const options1 = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url: Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_VIEW_PUSH")
  };
  return new Promise((resolve, reject) => {
    Axios(options1).then((data) => {
      return resolve(data);
    }).catch((error) => {
      return reject(error);
    });
  })

};

/**
 * Tao url request author
 * @param {string} idChannel
 * @param {string} idUser
 * @returns {string} urlRequestAuthor
 */
const redirectMicrosoft = (idChannel, idUser) => {
  const scopeAzure = Env.resourceServerGet("SCOPE");
  const data = {
    idChannel,
    idUser
  }
  const stateAzure = Crypto.createJWT(data);
  let urlRequestAuthor = `${Env.resourceServerGet(
    "API_URL_AUTH"
  )}${Env.resourceServerGet("API_AUTHOR")}`;
  urlRequestAuthor += `?client_id=${Env.resourceServerGet("AZURE_ID")}`;
  urlRequestAuthor += `&response_type=code&redirect_uri=${Env.resourceServerGet(
    "AZURE_REDIRECT"
  )}`;
  urlRequestAuthor += `&response_mode=query&scope=${encodeURIComponent(scopeAzure)}&state=${stateAzure}`;
  return urlRequestAuthor;
};

/**
 * Xu ly gui tin nhan yeu cau login
 * @param {object} event
 * @param {view} viewLoginResource
 * @returns {Promise}
 */
const sendMessageLogin = (event, viewLoginResource) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`,
      },
      data: {
        channel: event.channel,
        blocks: viewLoginResource,
      },
      url:
        Env.chatServiceGet("API_URL") +
        Env.chatServiceGet("API_POST_MESSAGE"),
    };
    const { channel, inviter } = event;
    options.data.blocks[2].elements[1].url = redirectMicrosoft(
      channel,
      inviter
    );
    Axios(options)
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
};

/**
 * Xu ly nguoi dung goi den settings
 * @param {object} viewSystemSetting
 * @param {object} body
 * @returns {Promise}
 */
const handlerSettingsMessage = (viewSystemSetting, body) => {
  return new Promise((resolve, reject) => {
    const data = {
      trigger_id: body.trigger_id,
      view: viewSystemSetting,
    };
    const options = {
      method: "POST",
      headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
      data: data,
      url:
        Env.chatServiceGet("API_URL") +
        Env.chatServiceGet("API_VIEW_OPEN"),
    };
    const { channel_id, user_id } = body;
    options.data.view.blocks[3].elements[1].url = redirectMicrosoft(
      channel_id,
      user_id
    );
    Axios(options)
      .then((data) => {
        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};

/**
 * Xu ly nguoi dung goi den settings
 * @param {object} viewSystemSetting
 * @param {object} body
 * @returns {Promise}
 */
const handlerShowEvents = async (body, template) => {
  const { channel_id = null } = body;
  const blocksView = [...template.listEvent.blocks];
  const chanCals = await ChannelsCalendar.query().where({ id_channel: channel_id });
  const AccCals = await MicrosoftAccountCalendar.query().where({ id_calendar: chanCals[0].id_calendar });
  const idAccount = AccCals[0].id_account;
  const options = {
    method: 'GET',
    headers: { 'X-Microsoft-AccountId': idAccount },
    url:
      Env.resourceServerGOF("GRAPH_URL") +
      Env.resourceServerGOF("GRAPH_CALENDARS") + `/${chanCals[1].id_calendar}/events`
  };
  const events = await Axios(options);
  if (!events) return;
  const event = events.data.value[0];
  blocksView[1].block_id = `${idAccount}/${AccCals[0].id_calendar}`;
  blocksView[1].accessory.options[0].value = `edit/${event.id}`;
  blocksView[1].accessory.options[1].value = `delete/${event.id}`;
  blocksView[1].fields[0].text = event.subject;
  blocksView[1].fields[3].text = event.start.dateTime.split('T')[0];
  const options1 = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`,
    },
    data: {
      channel: channel_id,
      blocks: blocksView,
    },
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_POST_MESSAGE"),
  };
  return Axios(options1);
};

module.exports = {
  handlerSettingsMessage,
  sendMessageLogin,
  handlerAddEvent,
  HandlerSubmitEvent,
  handlerBlocksActions,
  handlerShowEvents,
};
