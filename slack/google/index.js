const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const Template = require("../views/Template");
const Channels = require("../../models/Channels");
const GoogleAccount = require("../../models/GoogleAccount");
const GoogleCalendar = require("../../models/GoogleCalendar");
const Redis = require('../../utils/redis');
const AxiosConfig = require('./Axios');
const Axios = require('axios');
const {cryptoDecode, decodeJWT} = require('../../utils/Crypto');
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const GoogleAccountCalendar = require("../../models/GoogleAccountCalendar");
const Moment = require('moment');

const {
  getToken,
  getListCalendar,
  getProfile,
  getInfoChannel,
  saveInfoChannel,
  watchGoogleCalendar,
  getTimeZoneGoogle
} = require("./Auth");

const {
  requestPostLogin,
  requestSettings,
  requestHome,
  requestButtonSettings,
  requestAddEvent,
  createEvent,
  deleteEvent,
  updateEvent,
  handarlerShowListEvent,
  requestBlockActionsAllDay,
  handlerDeleteEvent,
  handlerUpdateEvent
} = require("./ChatService");
const {
  getEventUpdate,
  sendWatchNoti,
  getEvent,
} = require("./ResourceServer");

class SlackGoogle extends BaseServer {
  constructor(instanceId, opt) {
    super(instanceId, opt);
    this.authGoogle = this.authGoogle.bind(this);
    this.template = Template();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   */
  async handlerEvent(req, res) {
    try {
      let {event, authorizations} = req.body;
      const types = Env.chatServiceGOF("TYPE");
      let option = null;

      switch (event.subtype) {
        case types.BOT_ADD:
          option = requestPostLogin(event, this.template, this.setUidToken);
          break;
        // case types.APP_JOIN:
        // case types.MEMBER_JOIN:
        case types.CHANNEL_JOIN:
          if (authorizations[0].user_id === event.user) {
            option = requestPostLogin(event, this.template, this.setUidToken);
          }
          break;
        default:
          break;
      }

      if (option) await Axios(option);

      return res.status(200).send("OK");
    } catch (e) {
      return res.status(204).send("Error");
    }
  }

  /**
   *
   * @param {object} body
   * @returns {Promise}
   */
  handlerBodyText(body) {
    const chat = body.text.trim();
    const promise = new Promise((resolve) => resolve());
    if (chat === "home") {
      return requestHome(body, this.template.homePage);
    } else if (chat === "settings") {
      return requestSettings(body, this.template.systemSetting, this.setUidToken);

    } else if (chat === "google add-event") {
      return requestAddEvent(body, this.template.addEvent);
    } else if (chat === "show-events") {
      return handarlerShowListEvent(body, this.template)
    } else {
      return promise;
    }
  }

  /**
   *
   * @param {object} body
   * @param {object} payload
   * @param {string} accessToken
   * @returns {Promise}
   */
  async handlerPayLoad(body, payload) {
    payload = JSON.parse(payload);
    if (payload.type === "block_actions") {

      if (payload.actions[0].action_id === "btnSettings") {
        return requestButtonSettings(payload, this.template.systemSetting);
      } else if (payload.actions[0].action_id === "btnEventAdd") {
        return requestAddEvent(payload, this.template.addEvent);
      } else if (payload.actions[0].action_id === "allDay") {
        const options = requestBlockActionsAllDay(payload, this.template);
        await Axios(options);
      } else if (payload.actions[0].action_id === "overflow-action") {
        const value = payload.actions[0].selected_option.value.split('/');
        const blockId = payload.actions[0].block_id.split('/');
        if (value[0] === "edit") {
          return handlerUpdateEvent(payload, this.template.editEvent);
        } else if (value[0] === "delete") {
          return handlerDeleteEvent(payload, this.template.deleteEvent)
        }
      }
    } else if (payload.type === "view_submission" && payload.view.callback_id === 'deleteEvent') {
      const blockId = payload.view.blocks[0].block_id.split('/');
      const idEvent = blockId[1]
      const event = payload.view.blocks[1].block_id.split('/');
      const idAccount = event[0]
      return deleteEvent(idAccount, idEvent)
    } else if (payload.type === "view_submission" && payload.view.callback_id === 'addEvent') {
      console.log("add-event")
      const idCalendar = payload.view.state.values["GO_select_calendar"]["select_calendar"]["selected_option"].value;
      try {
        let event = {
          "summary": payload.view.state.values["GO_input_title"]["input-action"].value,
          "location": payload.view.state.values["GO_input_location"]["plain_text_input-action"].value,

          "start": {
            "timeZone": "Asia/Ho_Chi_Minh"
          },
          "end": {
            "timeZone": "Asia/Ho_Chi_Minh"
          },
          "recurrence": [
            `RRULE:FREQ=${payload.view.state.values["GO_select_everyday"]["static_select-action"]["selected_option"].value};`
          ],
          "reminders": {
            "useDefault": false,
            "overrides": [
              {
                "method": "email",
                "minutes": parseInt(payload.view.state.values["GO_select_before_notification"]["static_select-action"]["selected_option"].value),
              },
              {
                "method": "popup",
                "minutes": parseInt(payload.view.state.values["GO_select_before_notification"]["static_select-action"]["selected_option"].value),
              }
            ]
          }
        };

        if (payload.view.state.values["GO_check_all_day"]["allDay"].selected_options.length === 0) {
          const dateTimeStart = `${payload.view.state.values["GO_select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["GO_select-time-start"]["time-start-action"]["selected_option"].value}:00+07:00`;
          const dateTimeEnd = `${payload.view.state.values["GO_select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["GO_select-time-end"]["time-end-action"]["selected_option"].value}:00+07:00`;
          event.start.dateTime = dateTimeStart;
          event.end.dateTime = dateTimeEnd;
        } else if (payload.view.state.values["GO_check_all_day"]["allDay"].selected_options[0].value === 'true') {
          const dateAllDayStart = `${payload.view.state.values["GO_select-date-start"]["datepicker-action-start"]["selected_date"]}`;
          const dateAllDayEnd = `${payload.view.state.values["GO_select-date-end"]["datepicker-action-end"]["selected_date"]}`;
          event.start.date = dateAllDayStart;
          event.end.date = dateAllDayEnd;
        }

        console.log("event Create", event)
        return createEvent(event, idCalendar)
      } catch (e) {
        return e
      }
    } else if (payload.type === "view_submission" && payload.view.callback_id === 'editEvent') {
      console.log("edit nef")
      const value = payload.view.blocks[0].block_id.split('/')
      const idAccount = value[2]
      const idEvent = value[1];
      const idCalendar = payload.view.state.values["GO_select_calendar"]["select_calendar"]["selected_option"].value;
      let event = {
        "summary": payload.view.state.values["GO_input_title"]["input-action"].value,
        "location": payload.view.state.values["GO_input_location"]["plain_text_input-action"].value,

        "start": {
          "timeZone": "Asia/Ho_Chi_Minh"
        },
        "end": {
          "timeZone": "Asia/Ho_Chi_Minh"
        },
        "recurrence": [
          `RRULE:FREQ=${payload.view.state.values["GO_select_everyday"]["static_select-action"]["selected_option"].value};`
        ],
        "reminders": {
          "useDefault": false,
          "overrides": [
            {
              "method": "email",
              "minutes": parseInt(payload.view.state.values["GO_select_before_notification"]["static_select-action"]["selected_option"].value),
            },
            {
              "method": "popup",
              "minutes": parseInt(payload.view.state.values["GO_select_before_notification"]["static_select-action"]["selected_option"].value),
            }
          ]
        }
      };

      if (payload.view.state.values["GO_check_all_day"]["allDay"].selected_options.length === 0) {
        const dateTimeStart = `${payload.view.state.values["GO_select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["GO_select-time-start"]["time-start-action"]["selected_option"].value}:00+07:00`;
        const dateTimeEnd = `${payload.view.state.values["GO_select-date-start"]["datepicker-action-start"]["selected_date"]}T${payload.view.state.values["GO_select-time-end"]["time-end-action"]["selected_option"].value}:00+07:00`;
        event.start.dateTime = dateTimeStart;
        event.end.dateTime = dateTimeEnd;
      } else if (payload.view.state.values["GO_check_all_day"]["allDay"].selected_options[0].value === 'true') {
        const dateAllDayStart = `${payload.view.state.values["GO_select-date-start"]["datepicker-action-start"]["selected_date"]}`;
        const dateAllDayEnd = `${payload.view.state.values["GO_select-date-end"]["datepicker-action-end"]["selected_date"]}`;
        event.start.date = dateAllDayStart;
        event.end.date = dateAllDayEnd;
      }
      console.log("event", event)
      return updateEvent(event, idCalendar, idEvent, idAccount)
    }
  }

  async chatServiceHandler(req, res, next) {
    let {
      challenge = null,
      event = null,
      payload = null,
      command = null,
    } = req.body;
    try {
      if (challenge) {
        return res.status(200).send(challenge);
      }
      if (event) {
        return this.handlerEvent(req, res);
      } else if (command && /^\/cal$/.test(command)) {
        await this.handlerBodyText(req.body);
        return res.status(200).send("OK");
      }
      if (payload) {
        await this.handlerPayLoad(req.body, payload);
        return res.status(200).send({"response_action": "clear"});
      }
    } catch (error) {
      console.log("err", error.response.data)
      return res.status(403).send("Error");
    }
  }

  /**
   *
   * @param {object} calendar
   * @param {string} idAccount
   * @return {Promise<object|boolean>}
   */
  async handlerCalendars(calendar, idAccount) {
    const findCalendar = await GoogleCalendar.query().findOne({id: calendar.id});
    if (!findCalendar) await GoogleCalendar.query()
      .insert({id: calendar.id, name: calendar.summary});

    const googleAC = {
      id_calendar: calendar.id,
      id_account: idAccount,
    };
    const findGAC = await GoogleAccountCalendar.query().findOne(googleAC);
    if (!findGAC) return googleAC;
    return false
  }

  /**
   *
   * @param {object} profile
   * @param {object} tokens
   * @return {Promise<void>}
   */
  async handlerUser(profile, tokens) {
    const result = await getTimeZoneGoogle(tokens.access_token);
    const timeZone = result.data.value;
    Redis.client.setex(`GOOGLE_ACCESS_TOKEN_` + profile.sub, 60 * 59, tokens.access_token);
    await GoogleAccount.query().insert({
      id: profile.sub,
      name: profile.name,
      refresh_token: tokens.refresh_token,
      timezone: timeZone,
    });
  }

  async authGoogle(req, res) {
    let {code, state} = req.query;
    const cookie = req.cookies[this.instanceId];
    if (cookie) state = cookie;

    try {
      const payload = decodeJWT(state);
      const result = await this.getUidToken(payload.uid);
      if (!result) return res.status(401).send("jwt expired");
      const tokens = await getToken(code);
      await this.delUidToken(result);

      // Xử lý profile user google
      const profile = await getProfile(tokens.access_token);
      const user = await GoogleAccount.query().findById(profile.sub);
      if (!user) await this.handlerUser(profile, tokens);

      // Xử lý channel slack
      const {idChannel} = await decodeJWT(state);
      let channel = await Channels.query().findById(idChannel);
      if (!channel) {
        channel = await getInfoChannel(idChannel);
        await saveInfoChannel(channel)
      }

      // Xử lý danh sách calendar
      const {items} = await getListCalendar(profile.sub, tokens.access_token);
      const channelCalendar = [];
      let accountCalendar = [];
      const regex = /writer|owner/;
      for (let i = 0, length = items.length; i < length; i++) {
        if (regex.test(items[i].accessRole)) {
          channelCalendar.push({
            id_calendar: items[i].id,
            id_channel: idChannel,
            watch: true,
          });

          const result = await this.handlerCalendars(items[i], profile.sub);
          if (result) {
            accountCalendar.push(result);
            await watchGoogleCalendar(result);
          }
        }
      }

      await GoogleAccountCalendar.transaction(async trx => {
        try {
          await trx.insert(accountCalendar).into(GoogleAccountCalendar.tableName)
            .onConflict(["id_calendar", "id_account"])
            .merge();
        } catch (e) {
          trx.rollback();
        }
      });

      await ChannelsCalendar.transaction(async trx => {
        try {
          await trx.insert(channelCalendar).into(ChannelsCalendar.tableName)
            .onConflict(["id_calendar", "id_channel"])
            .merge();
        } catch (e) {
          trx.rollback();
        }
      });

      return res.send("Oke");
    } catch (err) {
      return res.status(400).send("ERROR");
    }
  }

  async resourceServerHandler(req, res, next) {
    try {
      const decode = cryptoDecode(req.headers['x-goog-channel-token']);
      const {idAccount, idCalendar} = JSON.parse(decode);
      let event = await getEventUpdate(req.headers, idAccount);
      console.log("eventgoogle", event)
      if (event.status === 'cancelled') {
        event = await getEvent(idCalendar, event.id, idAccount);
        if (!event.summary) return res.status(204).send("OK");
      }
      const account = await GoogleAccount.query().findById(idAccount);
      event.timezone = account.timezone;
      const arrChannelCalendar = await ChannelsCalendar.query().where({id_calendar: idCalendar, watch: true});
      await Promise.all(arrChannelCalendar.map(item => sendWatchNoti(item.id_channel, this.template.showEvent.blocks, event)));
      return res.status(204).send("OK");

    } catch (e) {
      return res.status(204).send("ERROR");
    }
  }
}

module.exports = SlackGoogle;
(async function () {
  const pipeline = new SlackGoogle(process.argv[2], {
    config: {
      path: process.argv[3],
      appRoot: __dirname,
    },
  });
  let prefix = process.argv[2]
    .split("-")[1]
    .split("");
  prefix.length = 2;
  await Template().init(prefix.join(""));
  await pipeline.init();
  pipeline.app.get("/auth/google", pipeline.authGoogle);
  AxiosConfig();
})();
