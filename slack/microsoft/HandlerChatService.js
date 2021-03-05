const Axios = require("axios");
const Crypto = require("../../utils/Crypto");
const Env = require("../../utils/Env");
const MomentTimezone = require('moment-timezone');
const Moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const MicrosoftCalendar = require("../../models/MicrosoftCalendar");
const { blockTime } = require('../../utils/ConvertTime');


/**
 * Show modals view add event to slack
 * @param {Object} body
 * @param {Object} template
 * @returns {Promise}
 */
const configAddEvent = async (body, template) => {
  const { trigger_id = null, calendars = null, userInfo = null } = body;
  const view = {
    ...template.addEvent,
    blocks: [...template.addEvent.blocks]
  };

  // chọn calendar default cho view add event
  view.blocks[1].accessory.initial_option = calendars[0];
  view.blocks[1].accessory.options = calendars;

  // lấy thời gian theo timezone người dùng slack
  const dateNow = new Date();
  let dateTime = MomentTimezone(dateNow).tz(userInfo.user.tz).format();
  view.blocks[4].accessory.initial_date = Moment(dateTime).format("YYYY-MM-DD");

  // xử lý time start, time end default
  let startTime = blockTime(dateTime);
  let endTime = blockTime(Moment(dateTime).add(15, 'm').format());

  // sau 23:30 --> 00:00 thì ngày khởi tạo event sẽ là ngày mới, thời gian
  // khởi tạo event là 00:00
  const time = Moment(dateTime).format("hh:mm").split(":");
  if (parseInt(time[0]) === 23 && parseInt(time[1]) >= 30) {
    startTime = "00:00";
    endTime = "00:15";
    const timezone = Moment(dateTime).format("Z");
    dateTime = `${Moment(dateTime).add(1, 'd')}T${startTime}:00${timezone}`
  }

  // gán time default cho view
  view.blocks[6].accessory.initial_option = {
    "text": {
      "type": "plain_text",
      "text": startTime,
      "emoji": true
    },
    "value": startTime
  };
  view.blocks[7].accessory.initial_option = {
    "text": {
      "type": "plain_text",
      "text": endTime,
      "emoji": true
    },
    "value": endTime
  };

  // lưu dữ liệu cache vào view phục vụ cho update view về sau
  view.private_metadata = JSON.stringify({ ...userInfo, dateTime, durationTime: 15, startTime });
  view.blocks.splice(5, 1);

  // khởi tạo option cho request tới slack.
  const data = {
    trigger_id,
    view,
  };
  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url:
      Env.chatServiceGOF("API_URL") +
      Env.chatServiceGOF("API_VIEW_OPEN"),
  };
  return options;
};
/**
 * xử lý action All đây
 * @param {object} payload
 * @param {array} blocks
 * @returns {object}
 */
const handlerAllDay = (payload, blocks) => {
  const { selected_options } = payload.actions[0];
  const { view } = payload;
  const { durationDay, dateTime, durationTime } = JSON.parse(view.private_metadata);

  // All day checked
  if (selected_options.length > 0) {
    if (!durationDay) {
      blocks[5].accessory.initial_date = Moment(dateTime).format("YYYY-MM-DD");
    } else {
      blocks[5].accessory.initial_date = Moment(dateTime)
        .add(durationDay, 'd')
        .format("YYYY-MM-DD");
    }
    view.blocks.splice(5, 2, blocks[5]);
    return view;
  }

  // event one-date
  const startTime = blockTime(dateTime);
  const timeStart = { ...blocks[6] };
  timeStart.accessory.initial_option = {
    "text": {
      "type": "plain_text",
      "text": startTime,
      "emoji": true
    },
    "value": startTime
  };
  const endTime = blockTime(Moment(dateTime).add(durationTime, 'm').format());
  const timeEnd = { ...blocks[7] };
  timeEnd.accessory.initial_option = {
    "text": {
      "type": "plain_text",
      "text": endTime,
      "emoji": true
    },
    "value": endTime
  };
  view.blocks.splice(5, 1, timeEnd);
  view.blocks.splice(5, 0, timeStart);
  return view;
};
/**
 * Xử lý action start date
 * @param {object} payload
 * @param {array} blocks
 * @returns {object}
 */
function handlerStartDate(payload, blocks) {
  const { view } = payload;
  const { values } = view.state;
  const priMetadata = JSON.parse(view.private_metadata);
  const selectedDate = values["MI_select-date-start"]["datepicker-action-start"]["selected_date"];
  const dateTime = `${selectedDate}T${priMetadata.startTime}`;
  priMetadata.dateTime = MomentTimezone(dateTime).tz(priMetadata.user.tz).format();
  view.private_metadata = JSON.stringify(priMetadata);
  if (values["MI_check_all_day"]["allDay"]["selected_options"].length === 0) return view;
  if (priMetadata.durationDay && priMetadata.durationDay > 0) {
    blocks[5].accessory.initial_date = Moment(priMetadata.dateTime)
      .add(priMetadata.durationDay, 'd')
      .format("YYYY-MM-DD");
  } else {
    blocks[5].accessory.initial_date = selectedDate
  }
  view.blocks.splice(5, 1, blocks[5]);
  if (view.blocks[5].block_id === 'MI_select-date-end-1') {
    view.blocks[5].block_id = "MI_select-date-end"
  } else {
    view.blocks[5].block_id = "MI_select-date-end-1"
  }
  return view
}

function _getSelectedDate(values, blockId, actionId) {
  if(!values[blockId]){
    return values[`${blockId}-1`][actionId]["selected_date"];
  } else {
    return values[blockId][actionId]["selected_date"];
  }
}
function _getSelectedOption(values, blockId, actionId) {
  if(!values[blockId]){
    return values[`${blockId}-1`][actionId]["selected_option"].value;
  } else {
    return values[blockId][actionId]["selected_option"].value;
  }
}
/**
 * Xử lý action end date
 * @param {object} payload
 * @param {array} blocks
 * @returns {object}
 */
function handlerEndDate(payload, blocks) {
  const { view } = payload;
  const { values } = view.state;
  const priMetadata = JSON.parse(view.private_metadata);
  const selectedDate = _getSelectedDate(values, "MI_select-date-end", "datepicker-action-end");
  const dateTime = priMetadata.dateTime.split("T")[0];
  let diff = Moment.preciseDiff(dateTime, selectedDate, true);
  if (diff.firstDateWasLater) {
    if (priMetadata.durationDay) {
      blocks[5].accessory.initial_date = Moment(priMetadata.dateTime)
        .add(priMetadata.durationDay, 'd')
        .format("YYYY-MM-DD");
    } else {
      blocks[5].accessory.initial_date = Moment(priMetadata.dateTime).format("YYYY-MM-DD")
    }
    view.blocks.splice(5, 1, blocks[5]);
    if (view.blocks[5].block_id === 'MI_select-date-end-1') {
      view.blocks[5].block_id = "MI_select-date-end"
    } else {
      view.blocks[5].block_id = "MI_select-date-end-1"
    }
    return view
  }
  priMetadata.durationDay = diff.days;
  view.private_metadata = JSON.stringify(priMetadata);
  blocks[5].accessory.initial_date = selectedDate;
  view.blocks.splice(5, 1, blocks[5]);
  if (view.blocks[5].block_id === 'MI_select-date-end-1') {
    view.blocks[5].block_id = "MI_select-date-end"
  } else {
    view.blocks[5].block_id = "MI_select-date-end-1"
  }
  return view
}
/**
 * Xử lý action start time
 * @param {object} payload
 * @returns {object}
 */
function handlerStartTime(payload) {
  const { view } = payload;
  const { values } = view.state;
  const priMetadata = JSON.parse(view.private_metadata);

  const selectedTime = _getSelectedOption(values, "MI_select-time-start", "time-start-action");
  const timeEnd = _getSelectedOption(values, "MI_select-time-end", "time-end-action");

  const date = priMetadata.dateTime.split("T")[0];
  const timezone = Moment(priMetadata.dateTime).format("Z");
  const datetimeStart = `${date}T${selectedTime}:00${timezone}`;
  const datetimeEnd = `${date}T${timeEnd}:00${timezone}`;
  let diff = Moment.preciseDiff(datetimeStart, datetimeEnd, true);
  if (diff.firstDateWasLater || selectedTime === timeEnd) {
    view.blocks[5].accessory.initial_option = {
      "text": {
        "type": "plain_text",
        "text": blockTime(priMetadata.dateTime),
        "emoji": true
      },
      "value": blockTime(priMetadata.dateTime)
    };
    if (view.blocks[5].block_id === 'MI_select-time-start-1') {
      view.blocks[5].block_id = "MI_select-time-start"
    } else {
      view.blocks[5].block_id = "MI_select-time-start-1"
    }
    return view;
  }

  priMetadata.dateTime = datetimeStart;
  if (diff.hours > 0) priMetadata.durationTime = diff.hours * 60 + diff.minutes;
  view.private_metadata = JSON.stringify(priMetadata);
  return view;
}
/**
 * Xử lý action end time
 * @param {object} payload
 * @returns {object}
 */
function handlerEndTime(payload) {
  const { view } = payload;
  const { values } = view.state;
  const priMetadata = JSON.parse(view.private_metadata);

  const selectedTime = _getSelectedOption(values, "MI_select-time-end", "time-end-action");
  const timeStart = _getSelectedOption(values, "MI_select-time-start", "time-start-action");

  const date = priMetadata.dateTime.split("T")[0];
  const timezone = Moment(priMetadata.dateTime).format("Z");
  const datetimeStart = `${date}T${timeStart}:00${timezone}`;
  const datetimeEnd = `${date}T${selectedTime}:00${timezone}`;
  let diff = Moment.preciseDiff(datetimeStart, datetimeEnd, true);
  if (diff.firstDateWasLater || selectedTime === timeStart) {
    let timeEnd = Moment(datetimeStart).add(priMetadata.durationTime, 'm').format();
    timeEnd = blockTime(timeEnd);
    view.blocks[6].accessory.initial_option = {
      "text": {
        "type": "plain_text",
        "text": timeEnd,
        "emoji": true
      },
      "value": timeEnd
    };
    if (view.blocks[6].block_id === 'MI_select-time-end-1') {
      view.blocks[6].block_id = "MI_select-time-end"
    } else {
      view.blocks[6].block_id = "MI_select-time-end-1"
    }
    return view;
  }

  priMetadata.dateTime = datetimeStart;
  if (diff.hours > 0) priMetadata.durationTime = diff.hours * 60 + diff.minutes;
  view.private_metadata = JSON.stringify(priMetadata);
  return view;
}

/**
 * handler Blocks Actions
 * @param {Object} payload
 * @param {Object} template
 * @returns {Promise}
 */
function handlerBlocksActions(payload, template) {
  const changePayload = delPropsView(payload);
  const { action_id } = changePayload.actions[0];
  const { blocks } = template.addEvent;
  let option = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_UPDATE")}`,
    data: {
      "view_id": payload["container"]["view_id"],
      "view": payload.view,
    }
  };
  switch (action_id) {
    case "allDay":
      option.data.view = handlerAllDay(changePayload, blocks);
      break;
    case "datepicker-action-start":
      option.data.view = handlerStartDate(changePayload, blocks);
      break;
    case "datepicker-action-end":
      option.data.view = handlerEndDate(changePayload, blocks);
      break;
    case "time-start-action":
      option.data.view = handlerStartTime(changePayload);
      break;
    case "time-end-action":
      option.data.view = handlerEndTime(changePayload);
      break;
    case "overflow-action":
      return handlerOverflowAction(payload, template);
    default:
      break;
  }
  if (option) delete option.data.view.state;
  return option
};
/**
 * Xu ly phan Overflow Action ( Sua hoac xoa su kien)
 * @param {Object} payload
 * @param {Object} template
 * @returns {Promise}
 */
const handlerOverflowAction = async (payload, template) => {
  const value = payload.actions[0].selected_option.value.split('/');
  const calendar = await MicrosoftCalendar.query().findById(payload.actions[0].block_id.split('/')[1]);
  payload.calendar = calendar;
  if (value[0] === "edit") {
    return null;
  }
  else if (value[0] === "delete") {
    return showDeleteEventView(payload, template);
  }
}

/**
 * Thuc hien xoa event
 * @param {string} idAccount
 * @param {string} idEvent
 * @returns {Promise}
 */
const showDeleteEventView = (payload, template) => {
  const { trigger_id = null } = payload;
  const { deleteEvent } = template;
  let view = JSON.stringify(deleteEvent);
  view = JSON.parse(view);
  view.private_metadata = payload.actions[0].block_id;
  view.private_metadata += "/" + payload.actions[0].selected_option.value;
  view.blocks[0].text.text += payload.actions[0].block_id.split('/')[2];
  view.blocks[1].text.text += payload.calendar.name;
  const data = {
    trigger_id: trigger_id,
    view: view,
  };
  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_VIEW_OPEN"),
  };
  return options;
}

/**
 * Thuc hien xoa event
 * @param {string} payload
 * @returns {Promise}
 */
const submitDelEvent = (payload) => {
  const idAccount = payload.view.private_metadata.split("/")[0].split('MI_')[1];
  const idEvent = payload.view.private_metadata.split("/")[4];
  const options = {
    method: 'DELETE',
    headers: { 'X-Microsoft-AccountId': idAccount },
    url: `${Env.resourceServerGOF("GRAPH_URL")}${Env.resourceServerGOF("GRAPH_MY_EVENT")}/${idEvent}`
  };
  return options;
}

/**
 *
 * @param {string} type
 * @param {dateTime} datetime
 * @param {*} date
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
const submitAddEvent = (values, account) => {
  try {
    console.log(JSON.stringify(values));
    const dateStart = values["MI_select-date-start"]["datepicker-action-start"]["selected_date"]
    let dateEnd = values["MI_select-date-start"]["datepicker-action-start"]["selected_date"]
    let timeStart = "00:00";
    let timeEnd = "00:00";
    if (values['MI_select-date-end']) {
      dateEnd = values["MI_select-date-end"]["datepicker-action-end"]["selected_date"]
    } else {
      timeStart = values["MI_select-time-start"]["time-start-action"]["selected_option"].value
      timeEnd = values["MI_select-time-end"]["time-end-action"]["selected_option"].value
    }
    let allDay = false;
    let timezone = account.timezone;
    if (values['MI_check_all_day']['allDay'].selected_options.length > 0) {
      allDay = true;
      timeStart = "00:00";
      timeEnd = "00:00";
      timezone = "";
      dateEnd = values["MI_select-date-end"]["datepicker-action-end"]["selected_date"];
    }
    const event = {
      "reminderMinutesBeforeStart": values['MI_select_before_notification']['static_select-action'].selected_option.value,
      "isReminderOn": true,
      "subject": values['MI_input_title']['input-action'].value,
      "isAllDay": allDay,
      "start": {
        "dateTime": `${dateStart}T${timeStart}:00.0000000`+timezone,
        "timeZone": `UTC`
      },
      "end": {
        "dateTime": `${dateEnd}T${timeEnd}:00.0000000`+timezone,
        "timeZone": `UTC`
      },
      "location": {
        "displayName": values['MI_input_location']['plain_text_input-action'].value,
      }
    }
    if(event.reminderMinutesBeforeStart === 'default'){
      event.reminderMinutesBeforeStart = 0;
    }
    if (values.MI_select_everyday['static_select-action']['selected_option'].value !== "nomal" && !allDay) {
      event.recurrence = getRecurrence(values.MI_select_everyday['static_select-action']['selected_option'].value, dateStart);
    }
    return event;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * Tao url request author
 * @param {string} idChannel
 * @param {string} idUser
 * @param {function} setUidToken
 * @returns {string} urlRequestAuthor
 */
const redirectMicrosoft = (idChannel, idUser, setUidToken) => {
  const scopeAzure = Env.resourceServerGet("SCOPE");
  const data = {
    uid: uuidv4(),
    idChannel,
    idUser
  }
  const stateAzure = Crypto.createJWT(data);
  setUidToken(data.uid);
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
 * @param {function} setUidToken
 * @returns {Promise}
 */
const sendMessageLogin = (event, template, setUidToken) => {
  const blocks = [...template.loginResource];
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`,
    },
    data: {
      channel: event.channel,
      blocks,
    },
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_POST_MESSAGE"),
  };
  const { channel, inviter } = event;
  options.data.blocks[2].elements[1].url = redirectMicrosoft(
    channel,
    inviter,
    setUidToken
  );
  return options;
};

/**
 * Xu ly nguoi dung goi den settings
 * @param {object} viewSystemSetting
 * @param {function} setUidToken
 * @param {object} body
 * @returns {Promise}
 */
const handlerSettingsMessage = (viewSystemSetting, body, setUidToken) => {
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
      user_id,
      setUidToken
    );
    Axios(options)
      .then((data) => {
        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};
/**
 * Xóa các thành phần của view
 * @param {object} payload
 * @return {object}
 */
function delPropsView(payload) {
  if (payload.view) {
    delete payload.view.id;
    delete payload.view.team_id;
    delete payload.view.hash;
    delete payload.view.previous_view_id;
    delete payload.view.root_view_id;
    delete payload.view.app_id;
    delete payload.view.app_installed_team_id;
    delete payload.view.bot_id;
  }
  return payload;
}

/**
 * Show all events
 * @param {object} body
 * @param {object} template
 * @returns {Promise}
 */
const configShowEvents = (body, template) => {
  const { channel_id, events, idAccount, idCalendar } = body;
  const blocksView = [...template.listEvent.blocks];
  const event = events.data.value[0];
  blocksView[1].block_id = `MI_${idAccount}/${idCalendar}/${event.subject}`;
  blocksView[1].accessory.options[0].value = `edit/${event.id}`;
  blocksView[1].accessory.options[1].value = `delete/${event.id}`;
  blocksView[1].fields[0].text = event.subject;
  const options = {
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
  return options;
};

module.exports = {
  handlerSettingsMessage,
  sendMessageLogin,
  configAddEvent,
  submitAddEvent,
  handlerBlocksActions,
  configShowEvents,
  submitDelEvent
};
