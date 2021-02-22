const Axios = require("axios");
const EncodeJws = require("./Jws");
const Env = require("../../utils/Env");
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const MicrosoftCalendar = require("../../models/MicrosoftCalendar");


const handlerAddEvent = async (body, template) => {
  const { trigger_id = null, channel_id = null } = body;
  const { addEvent } = template;
  // const viewCp = Object.assign({}, addEvent);
  const data = {
    trigger_id: trigger_id,
    view: addEvent,
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
    console.log(calendar);
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
  options.data.view.blocks.splice(5, 1);
  const result = await Axios(options);
  console.log(result);
  return;
};

const handlerBlocksActions = async (payload, template) => {
  console.log("payload:", payload);
  const { addEvent } = template;
  let viewDT = payload.view;
  //"response_action": "update",
  const { action_id = null, selected_options = null } = payload.actions[0];
  if (action_id === "allday" && selected_options.length === 0) {
    console.log("all day false");
    viewDT.blocks.splice(5, 1);
    // viewDT.blocks.splice(5, 0, addEvent.blocks[6]);
    // viewDT.blocks.splice(6, 0, addEvent.blocks[7]);
  }

  else if (action_id === "allday" && selected_options.length > 0) {
    console.log("all day true");
    viewDT.blocks.splice(5, 2);
    // viewDT.blocks.splice(5, 0, addEvent.blocks[5]);
  }
  console.log("payload find tringger_id:", payload.trigger_id);

  let data = {
    "view_id": payload["container"]["view_id"],
    "view": addEvent.blocks.splice(5, 2)
  }
  const options = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_UPDATE")}`
  };
  console.log("viewDT",viewDT);
  return Axios(options);
  // console.log("result:", result.data.response_metadata.messages);
  // options.data = {
  //   "view_id": payload["trigger_id"],
  //   "view": viewDT
  // }
  // options.url = `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_PUSH")}`


};

const submitAddEvent = async (payload, res) => {
  // const data = {

  // }
  // const options = {
  //   method: 'POST',
  //   headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessTokenAzure}` },
  //   data: JSON.stringify(data),
  //   url: Env.resourceServerGOF("GRAPH_URL") +
  //     Env.resourceServerGOF("GRAPH_CALENDARS") + `/${req.params.id}/events`
  // };
  // return Axios(options);
  const { trigger_id = null, view = null } = payload;

  const data = {
    "trigger_id": trigger_id,
    "view": view
  }
  const options = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url: `https://slack.com/api/views.push`
  };
  await Axios(options);

  return res.status(202).send({
    "response_action": "clear"
  });

};

const viewClosed = ()=>{
  return res.status(202).send({
    "response_action": "clear"
  });
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
  handlerBlocksActions
};
