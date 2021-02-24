const Axios = require("axios");
const EncodeJws = require("./Jws");
const Env = require("../../utils/Env");
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const MicrosoftCalendar = require("../../models/MicrosoftCalendar");
const MicrosoftAccountCalendar = require("../../models/MicrosoftAccountCalendar");

const handlerAddEvent = async (body, template, timePicker) => {
  const { trigger_id = null, channel_id = null } = body;
  const { addEvent } = template;
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
  options.data.view.blocks[6].accessory.options = timePicker;
  options.data.view.blocks[7].accessory.options = timePicker;
  addView.blocks.splice(5, 1);
  return Axios(options);
};

const handlerBlocksActions = async (payload, template) => {

  console.log("handlerBlocksActions:");
  const { addEvent } = template;
  let addView = Object.assign({},addEvent);
  addView.blocks = payload.view.blocks;

  const { action_id = null, selected_options = null } = payload.actions[0];
  if (action_id === "allday" && selected_options.length === 0) {
    console.log("all day false");
    addView.blocks.splice(5, 1);
    addView.blocks.splice(5, 0, addEvent.blocks[7]);
    addView.blocks.splice(5, 0, addEvent.blocks[6]);
  }

  else if (action_id === "allday" && selected_options.length > 0) {
    console.log("all day true");
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
  return new Promise((resolve,reject)=>{
    Axios(options).then((resp)=>{
      // console.log(resp.data);
      return resolve(resp);
    }).catch((err)=>{
      // console.log(err);
      return reject(err);
    });
  });
};

Date.prototype.addMonth = function (months) {
  let month = new Date(this.valueOf());
  month.setMonth(month.getMonth() + months);
  return month;
}

const getRecurrence = (type) => {
  const recurrence = {
    "pattern": {
      "type": "absoluteMonthly",
      "interval": 1,
      "dayOfMonth": 24
    },
    "range": {
      "startDate": "2021-02-24",
      "endDate": "2022-02-24"
    }
  }

  switch(type){
    case "daily":
      recurrence.pattern.dayOfMonth = 0;

      break;
    case "weekly":
      // let month = recurrence.range.endDate.split('-');
      // month[1] = month[1] + 1;
      // recurrence.range.endDate = ;
      break;
    default:
      break;
  }
  return recurrence;
}

const submitAddEvent = async (payload,res) => {
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
    allDay = true
  }
  const data =
  {
    "reminderMinutesBeforeStart": values['select_before_notification']['static_select-action'].selected_option.value,
    "isReminderOn": true,
    "subject": values['input_title']['input-action'].value,
    "isAllDay": allDay,
    "start": {
      "dateTime": `${dateStart}T${timeStart}:00.0000000`,
      "timeZone": "Asia/Ho_Chi_Minh"
    },
    "end": {
      "dateTime": `${dateEnd}T${timeEnd}:00.0000000`,
      "timeZone": "Asia/Ho_Chi_Minh"
    },
    "location": {
      "displayName": values['input_location']['plain_text_input-action'].value,
    }
  }
  console.log(values['select_before_notification']['static_select-action'].selected_option);

  const idCalendar = values["select_calendar"]["select_calendar"]["selected_option"].value;

  const accountCal = await MicrosoftAccountCalendar.query().findOne({ id_calendar: idCalendar });

  const options = {
    method: 'POST',
    headers: { "Content-Type": "application/json", 'X-Microsoft-AccountId': accountCal.id_account },
    data: JSON.stringify(data),
    url: `https://graph.microsoft.com/v1.0/me/calendars/${idCalendar}/events`
  };
  // Env.resourceServerGOF("GRAPH_URL") +
  // Env.resourceServerGOF("GRAPH_CALENDARS") + `/${idCalendar}/events`

  await Axios(options);
  const { trigger_id = null, view = null } = payload;
  const data1 = {
    "trigger_id": trigger_id,
    "view": view
  }
  const options1 = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data1,
    url: `https://slack.com/api/views.push`
  };
  return Axios(options1);

};

const clearViews = async (payload) => {
  const { trigger_id = null, view = null } = payload;
  const data1 = {
    "trigger_id": trigger_id,
    "view": view
  }
  const options1 = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data1,
    url: `https://slack.com/api/views.push`
  };
  return Axios(options1);
}

/**
 * Tao url request author
 * @param {string} idChannel
 * @param {string} idUser
 * @returns {string} urlRequestAuthor
 */
const redirectMicrosoft = (idChannel, idUser) => {
  try {
    const scopeAzure = Env.resourceServerGet("SCOPE");
    const stateAzure = EncodeJws.createJWS(idChannel, idUser);
    let urlRequestAuthor = `${Env.resourceServerGet(
      "API_URL_AUTH"
    )}${Env.resourceServerGet("API_AUTHOR")}`;
    urlRequestAuthor += `?client_id=${Env.resourceServerGet("AZURE_ID")}`;
    urlRequestAuthor += `&response_type=code&redirect_uri=${Env.resourceServerGet(
      "AZURE_REDIRECT"
    )}`;
    urlRequestAuthor += `&response_mode=query&scope=${encodeURIComponent(scopeAzure)}&state=${stateAzure}`;
    return urlRequestAuthor;
  } catch (error) {
    return "error";
  }
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

module.exports = {
  handlerSettingsMessage,
  sendMessageLogin,
  handlerAddEvent,
  submitAddEvent,
  handlerBlocksActions,
};
