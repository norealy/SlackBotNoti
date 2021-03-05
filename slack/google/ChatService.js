const Env = require('../../utils/Env');
const Axios = require('axios');
const MomentTimezone = require('moment-timezone');
const Moment = require('moment');
const {createJWT} = require('../../utils/Crypto');
const {blockTime} = require('../../utils/ConvertTime');
const {v4: uuidv4} = require('uuid');
require('moment-precise-range-plugin');

/**
 * Cấu hình đường dẫn redirect login google
 * @param accessToken
 * @returns {string} url
 */
const configUrlAuth = (accessToken) => {
  let url = Env.resourceServerGOF('API_OAUTH');
  url += `?scope=${encodeURIComponent(Env.resourceServerGOF("SCOPE_CALENDAR"))}`;
  url += `+${Env.resourceServerGOF("SCOPE_USER_INFO")}`;
  url += `&access_type=${Env.resourceServerGOF("ACCESS_TYPE")}`;
  url += `&response_type=${Env.resourceServerGOF("RESPONSE_TYPE")}`;
  url += `&client_id=${Env.resourceServerGOF("CLIENT_ID")}`;
  url += `&redirect_uri=${Env.resourceServerGOF("REDIRECT_URI")}`;
  url += `&state=${accessToken}`;
  return url
};

/**
 * Thực thi việc requestLogin gửi về một Post Message
 * @param {object} event
 * @param {object} template
 * @param {function} setUidToken
 * @returns {object}
 */
const requestPostLogin = (event, template, setUidToken) => {
  const blocks = [...template.loginResource];
  const option = {method: "POST"};
  option.url = Env.chatServiceGOF('API_URL');
  option.url += Env.chatServiceGOF('API_POST_MESSAGE');
  option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
  const {inviter, channel} = event;
  const iat = Math.floor(new Date() / 1000);
  const uid = uuidv4();
  const payload = {
    uid,
    idUser: inviter,
    idChannel: channel,
    iat,
    exp: iat + parseInt(Env.getOrFail("JWT_DURATION"))
  };
  setUidToken(uid);
  const accessToken = createJWT(payload);
  blocks[2].elements[0].url = configUrlAuth(accessToken);
  option.data = {
    "channel": event.channel,
    blocks
  };
  return option
};

/**
 * Trả về 1 View Settings
 * @param{object} body
 * @param {view} systemSetting
 * @returns {Promise}
 */
const requestSettings = (body, systemSetting) => {
  const option = {method: "POST"};
  option.url = Env.chatServiceGOF('API_URL');
  option.url += Env.chatServiceGOF('API_VIEW_OPEN');
  option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
  const {user_id, channel_id} = body;
  const {trigger_id} = body;
  const iat = Math.floor(new Date() / 1000);
  const payload = {
    idUser: user_id,
    idChannel: channel_id,
    iat,
    exp: iat + parseInt(Env.getOrFail("JWT_DURATION"))
  };
  const accessToken = createJWT(payload);
  systemSetting.blocks[3].elements[0].url = configUrlAuth(accessToken);
  option.data = {
    "trigger_id": trigger_id,
    "view": systemSetting,
  };
  return option;
};

/**
 * Thực hiện việc insert view home page
 * @param body
 * @param  {view} homePage
 * @returns {Promise}
 */
const requestHome = (body, homePage) => {
  const option = {method: "POST"};
  option.url = Env.chatServiceGOF('API_URL');
  option.url += Env.chatServiceGOF('API_VIEW_PUBLISH');
  option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
  const {user_id, trigger_id} = body;
  option.data = {
    "user_id": user_id,
    "trigger_id": trigger_id,
    "view": homePage,
  };
  return option;
};

/**
 * Cấu hình request view add event
 * @param {object} body
 * @param {object} template
 * @return {object}
 */
const configAddEvent = (body, template) => {
  const {trigger_id, calendars, userInfo} = body;
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
  if(parseInt(time[0]) === 23 && parseInt(time[1]) >= 30){
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
  view.private_metadata = JSON.stringify({...userInfo, dateTime, durationTime: 15, startTime});
  view.blocks.splice(5, 1);

  // khởi tạo option cho request tới slack.
  let option = {method: "POST"};
  option.url = Env.chatServiceGOF('API_URL');
  option.url += Env.chatServiceGOF('API_VIEW_OPEN');
  option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
  option.data = {
    "trigger_id": trigger_id,
    view
  };

  return option
};

/**
 * xử lý action All đây
 * @param {object} payload
 * @param {array} blocks
 * @returns {object}
 */
const handlerAllDay = (payload, blocks) => {
  const {selected_options} = payload.actions[0];
  const {view} = payload;
  const {durationDay, dateTime, durationTime} = JSON.parse(view.private_metadata);

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
  const timeStart = {...blocks[6]};
  timeStart.accessory.initial_option = {
    "text": {
      "type": "plain_text",
      "text": startTime,
      "emoji": true
    },
    "value": startTime
  };
  const endTime = blockTime(Moment(dateTime).add(durationTime, 'm').format());
  const timeEnd = {...blocks[7]};
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
  const {view} = payload;
  const {values} = view.state;
  const priMetadata = JSON.parse(view.private_metadata);
  const selectedDate = values["GO_select-date-start"]["datepicker-action-start"]["selected_date"];
  const dateTime = `${selectedDate}T${priMetadata.startTime}`;
  priMetadata.dateTime = MomentTimezone(dateTime).tz(priMetadata.user.tz).format();
  view.private_metadata = JSON.stringify(priMetadata);
  if (values["GO_check_all_day"]["allDay"]["selected_options"].length === 0) return view;
  if (priMetadata.durationDay && priMetadata.durationDay > 0) {
    blocks[5].accessory.initial_date = Moment(priMetadata.dateTime)
      .add(priMetadata.durationDay, 'd')
      .format("YYYY-MM-DD");
  } else {
    blocks[5].accessory.initial_date = selectedDate
  }
  view.blocks.splice(5, 1, blocks[5]);
  if(view.blocks[5].block_id === 'GO_select-date-end-1'){
    view.blocks[5].block_id = "GO_select-date-end"
  } else {
    view.blocks[5].block_id = "GO_select-date-end-1"
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
  const {view} = payload;
  const {values} = view.state;
  const priMetadata = JSON.parse(view.private_metadata);
  const selectedDate = _getSelectedDate(values, "GO_select-date-end", "datepicker-action-end");
  const dateTime = priMetadata.dateTime.split("T")[0];
  let diff = Moment.preciseDiff(dateTime, selectedDate, true);
  if(diff.firstDateWasLater) {
    if (priMetadata.durationDay) {
      blocks[5].accessory.initial_date = Moment(priMetadata.dateTime)
        .add(priMetadata.durationDay, 'd')
        .format("YYYY-MM-DD");
    } else {
      blocks[5].accessory.initial_date = Moment(priMetadata.dateTime).format("YYYY-MM-DD")
    }
    view.blocks.splice(5, 1, blocks[5]);
    if(view.blocks[5].block_id === 'GO_select-date-end-1'){
      view.blocks[5].block_id = "GO_select-date-end"
    } else {
      view.blocks[5].block_id = "GO_select-date-end-1"
    }
    return view
  }
  priMetadata.durationDay = diff.days;
  view.private_metadata = JSON.stringify(priMetadata);
  blocks[5].accessory.initial_date = selectedDate;
  view.blocks.splice(5, 1, blocks[5]);
  if(view.blocks[5].block_id === 'GO_select-date-end-1'){
    view.blocks[5].block_id = "GO_select-date-end"
  } else {
    view.blocks[5].block_id = "GO_select-date-end-1"
  }
  return view
}

/**
 * Xử lý action start time
 * @param {object} payload
 * @returns {object}
 */
function handlerStartTime(payload) {
  const {view} = payload;
  const {values} = view.state;
  const priMetadata = JSON.parse(view.private_metadata);

  const selectedTime = _getSelectedOption(values, "GO_select-time-start", "time-start-action");
  const timeEnd = _getSelectedOption(values, "GO_select-time-end", "time-end-action");

  const date = priMetadata.dateTime.split("T")[0];
  const timezone = Moment(priMetadata.dateTime).format("Z");
  const datetimeStart = `${date}T${selectedTime}:00${timezone}`;
  const datetimeEnd = `${date}T${timeEnd}:00${timezone}`;
  let diff = Moment.preciseDiff(datetimeStart, datetimeEnd, true);
  if(diff.firstDateWasLater || selectedTime === timeEnd){
    view.blocks[5].accessory.initial_option = {
      "text": {
        "type": "plain_text",
        "text": blockTime(priMetadata.dateTime),
        "emoji": true
      },
      "value": blockTime(priMetadata.dateTime)
    };
    if(view.blocks[5].block_id === 'GO_select-time-start-1'){
      view.blocks[5].block_id = "GO_select-time-start"
    } else {
      view.blocks[5].block_id = "GO_select-time-start-1"
    }
    return view;
  }

  priMetadata.dateTime = datetimeStart;
  if(diff.hours > 0) priMetadata.durationTime = diff.hours * 60 + diff.minutes;
  view.private_metadata = JSON.stringify(priMetadata);
  return view;
}

/**
 * Xử lý action end time
 * @param {object} payload
 * @returns {object}
 */
function handlerEndTime(payload) {
  const {view} = payload;
  const {values} = view.state;
  const priMetadata = JSON.parse(view.private_metadata);

  const selectedTime = _getSelectedOption(values, "GO_select-time-end", "time-end-action");
  const timeStart = _getSelectedOption(values, "GO_select-time-start", "time-start-action");

  const date = priMetadata.dateTime.split("T")[0];
  const timezone = Moment(priMetadata.dateTime).format("Z");
  const datetimeStart = `${date}T${timeStart}:00${timezone}`;
  const datetimeEnd = `${date}T${selectedTime}:00${timezone}`;
  let diff = Moment.preciseDiff(datetimeStart, datetimeEnd, true);
  if(diff.firstDateWasLater || selectedTime === timeStart){
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
    if(view.blocks[6].block_id === 'GO_select-time-end-1'){
      view.blocks[6].block_id = "GO_select-time-end"
    } else {
      view.blocks[6].block_id = "GO_select-time-end-1"
    }
    return view;
  }

  priMetadata.dateTime = datetimeStart;
  if(diff.hours > 0) priMetadata.durationTime = diff.hours * 60 + diff.minutes;
  view.private_metadata = JSON.stringify(priMetadata);
  return view;
}

/**
 * Xóa các thành phần của view
 * @param {object} payload
 * @return {object}
 */
function delPropsView(payload) {
  if(payload.view){
    delete payload.view.id;
    delete payload.view.team_id;
    delete payload.view.hash;
    delete payload.view.previous_view_id;
    delete payload.view.root_view_id;
    delete payload.view.app_id;
    delete payload.view.app_installed_team_id;
    delete payload.view.bot_id;
  }
  return payload
}

/**
 * Xử lý action view
 * @param payload
 * @param template
 * @return {object|null}
 */
function handlerAction(payload, template) {
  const changePayload = delPropsView(payload);
  const {action_id} = changePayload.actions[0];
  const {blocks} = template.addEvent;
  let option = {
    method: 'POST',
    headers: {'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}`},
    url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_UPDATE")}`,
    data: {
      "view_id": payload["container"]["view_id"],
      "view": payload.view,
    }
  };
  switch(action_id) {
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
    default:
      option = null;
      break;
  }

  if(option) delete option.data.view.state;
  return option
}

/**
 *  khi người dùng thực hiện click vào button login google ở home view
 * @param  {object} payload
 * @param {view} systemSetting
 * @returns {Promise}
 */
const requestButtonSettings = (payload, systemSetting,) => {
  const option = {method: "POST"};
  option.url = Env.chatServiceGOF('API_URL');
  option.url += Env.chatServiceGOF('API_VIEW_OPEN');
  option.headers = {'Authorization': `Bearer ${Env.chatServiceGet("BOT_TOKEN")}`};
  const {user, trigger_id} = payload;
  const iat = Math.floor(new Date() / 1000);
  const data = {
    idUser: user.id,
    idChannel: user.name,
    iat,
    exp: iat + parseInt(Env.getOrFail("JWT_DURATION"))
  };
  const accessToken = createJWT(data);
  option.data = {
    "trigger_id": trigger_id,
    "view": systemSetting
  };
  option.data.view.blocks[3].elements[0].url = configUrlAuth(accessToken);
  return Axios(option);
};

/**
 * Lấy ra timezone offset
 * @param {string} country
 * @return {string}
 */
function getTZOffset(country) {
  return `${MomentTimezone().tz(country).format("zz")}:00`
}

/**
 * Tạo sự kiện cho calendar
 * @param {object} values
 * @param {object} account
 * @returns {Promise}
 */
const createEvent = (values, account) => {
  let timezone = getTZOffset(account.timezone);
  const location = values["GO_input_location"]["plain_text_input-action"].value;
  const recurrence = values["GO_select_everyday"]["static_select-action"]["selected_option"].value;
  const noti = values["GO_select_before_notification"]["static_select-action"]["selected_option"].value;
  const addDay = values["GO_check_all_day"]["allDay"]["selected_options"];
  const startDate = values["GO_select-date-start"]["datepicker-action-start"]["selected_date"];

  const event = {};
  event["summary"] = values["GO_input_title"]["input-action"].value;
  if(location) event["location"] = location.trim();
  event["start"] = { "timeZone": account.timezone };
  event["end"] = { "timeZone": account.timezone };
  if(recurrence !== "no") event["recurrence"] = [
    `RRULE:FREQ=${recurrence};`
  ];

  if(noti !== "default"){
    event["reminders"] = {};
    event["reminders"].useDefault = false;
    event["reminders"].overrides = [
      {
        "method": "email",
        "minutes": parseInt(noti),
      },
      {
        "method": "popup",
        "minutes": parseInt(noti),
      }
    ];
  }

  if (addDay.length === 0) {
    const timeStart = _getSelectedOption(values, "GO_select-time-start", "time-start-action");
    const timeEnd = _getSelectedOption(values, "GO_select-time-end", "time-end-action");

    const dateTimeStart = `${startDate}T${timeStart}:00${timezone}`;
    const dateTimeEnd = `${startDate}T${timeEnd}:00${timezone}`;

    event.start.dateTime = dateTimeStart;
    event.end.dateTime = dateTimeEnd;
  } else {
    const endDate = _getSelectedDate(values, "GO_select-date-end", "datepicker-action-end");
    event.start.date = startDate;
    event.end.date = endDate;
  }
  return event;
};

module.exports = {
  requestPostLogin,
  requestSettings,
  requestHome,
  requestButtonSettings,
  configAddEvent,
  createEvent,
  handlerAction,
};
