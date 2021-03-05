const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const { cryptoDecode } = require("../../utils/Crypto");
const Template = require("../views/Template");
const { decodeJWT } = require("../../utils/Crypto");
const AxiosConfig = require('./Axios');
const Axios = require('axios');
const MicrosoftCalendar = require("../../models/MicrosoftCalendar");
const ChannelsCalendar = require("../../models/ChannelsCalendar");
const MicrosoftAccountCalendar = require("../../models/MicrosoftAccountCalendar");
const MicrosoftAccount = require("../../models/MicrosoftAccount");

const {
  getToken,
  getListCalendar,
  getProfileUser,
  saveUserProfile,
  saveCalendar,
  saveInfoChannel,
  saveAccountCalendar,
  saveChannelCalendar,
} = require("./Auth");
const {
  sendMessageLogin,
  handlerSettingsMessage,
  configAddEvent,
  handlerBlocksActions,
  submitAddEvent,
  configShowEvents,
  submitDelEvent
} = require("./HandlerChatService");
const {
  handlerCreated,
  handlerUpdated,
  handlerDeleted,
} = require("./HandlerResourceServer");

class SlackMicrosoft extends BaseServer {
  constructor(instanceId, opt) {
    super(instanceId, opt);
    this.microsoftAccess = this.microsoftAccess.bind(this);
    this.template = Template();
  }

  /**
   * Xử lý sự kện add event
   * @param {object} body
   * @return {Promise<{object}>}
   */
  async handlerAddEvent(body) {
    const { user_id } = body;
    body.userInfo = await this.getUserInfo(user_id);
    body.calendars = await this.getCalendarsInChannel(body.channel_id);
    return configAddEvent(body, this.template)
  }

  /**
   * Xử lý event
   * @param {object} req
   * @param {object} res
   */
  async handlerEvent(req, res) {
    try {
      let { event, authorizations } = req.body;
      const types = Env.chatServiceGOF("TYPE");
      let option = null;
      switch (event.subtype) {
        case types.BOT_ADD:
        case types.APP_JOIN:
          option = sendMessageLogin(event, this.template, this.setUidToken);
          break;
        case types.CHANNEL_JOIN:
          if (authorizations[0].user_id === event.user) {
            option = sendMessageLogin(event, this.template, this.setUidToken);
          }
          break;
        default:
          break;
      }
      if (option) await Axios(option).then(({ data }) => {
        if (!data.ok) throw data
      });

      return res.status(200).send("OK");
    } catch (e) {
      return res.status(204).send("Error");
    }
  }
  /**
   * get events in calendar
   * @param {string} idAccount
   * @param {string} idCalendar
   * @returns {Object} option
   */
  getEventsInCalendar = (idAccount, idCalendar) => {
    const options = {
      method: 'GET',
      headers: { 'X-Microsoft-AccountId': idAccount },
      url:
        Env.resourceServerGOF("GRAPH_URL") +
        Env.resourceServerGOF("GRAPH_CALENDARS") + `/${idCalendar}/events`
    };
    return options;
  }
  /**
   * Xử lý sự kện add event
   * @param {object} body
   * @return {Promise<{object}>}
   */
  async handlerShowEvents(body) {
    const { channel_id = null } = body;
    const chanCals = await ChannelsCalendar.query().where({ id_channel: channel_id });
    const AccCals = await MicrosoftAccountCalendar.query().where({ id_calendar: chanCals[0].id_calendar });
    const idAccount = AccCals[0].id_account;
    const idCalendar = chanCals[0].id_calendar;
    const options = this.getEventsInCalendar(idAccount, idCalendar);
    const events = await Axios(options);
    if (!events) return null;
    body.events = events;
    body.idAccount = idAccount;
    body.idCalendar = idCalendar;
    return configShowEvents(body, this.template)
  }
  /**
   * Xử lý command
   * @param {object} req
   * @param {object} res
   * @returns {Promise}
   */
  async handlerCommand(req, res) {
    try {
      let text = req.body.text.trim();
      let option = null;
      const { systemSetting } = this.template;
      switch (text) {
        case "settings":
          option = handlerSettingsMessage(systemSetting, req.body);
          break;
        case "mi add-event":
          option = await this.handlerAddEvent(req.body);
          break;
        case "mi show-events":
          option = await this.handlerShowEvents(req.body);
          break;
        default:
          option = null;
          break;
      }
      if (option) Axios(option)
        .then(({ data }) => {
          if (!data.ok) throw data
        });
    } catch (error) {
      res.status(204).send("Command error");
    }
  }

  /**
 * Lấy danh sách calendar
 * @param {string} channelId
 * @return {Promise<[]>}
 */
  async getCalendarsInChannel(channelId) {
    const channelCalendar = await ChannelsCalendar.query().where({ id_channel: channelId });
    const calendars = [];
    for (let i = 0, length = channelCalendar.length; i < length; i++) {
      const calendar = await MicrosoftCalendar.query().findById(channelCalendar[i].id_calendar);
      calendars.push({
        "text": {
          "type": "plain_text",
          "text": calendar.name,
          "emoji": true
        },
        "value": calendar.id
      });
    }
    return calendars
  }

  /**
   * lấy ra thông tin người dùng slack
   * @param {string} id
   * @return {Promise<unknown>}
   */
  getUserInfo(id) {
    return new Promise((resolve, reject) => {
      const option = {
        method: 'Get',
        headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
        url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_USER_INFO")}?user=${id}`,
      };
      Axios(option)
        .then(res => {
          if (!res.data.ok) reject(res.data);
          resolve(res.data)
        })
        .catch(reject)
    })
  }
  /**
   *  Xu ly cac su kien nguoi dung goi lenh xu ly bot
   * @param {object} payload
   * @returns {Promise}
   */
  async handlerSubmit(payload) {
    const { callback_id } = payload.view;
    let option = null;
    switch (callback_id) {
      case "MI_delete-event":
        option = submitDelEvent(payload);
        break;
      case "MI_add-event":
        const { values } = payload.view.state;
        const idCalendar = values["MI_select_calendar"]["select_calendar"]["selected_option"].value;
        const { id_account } = await MicrosoftAccountCalendar.query().findOne({ id_calendar: idCalendar });
        const account = await MicrosoftAccount.query().findOne({ id: id_account });
        option = {
          method: 'POST',
          headers: { "Content-Type": "application/json", 'X-Microsoft-AccountId': id_account },
          data: submitAddEvent(values, account),
          url:
            Env.resourceServerGOF("GRAPH_URL") +
            Env.resourceServerGOF("GRAPH_CALENDARS") + `/${idCalendar}/events`
        };
        break;
      default:
        break;
    }
    return option;
  }

  /**
   *
   * @param {Object} payload
   * @param {object} res
   */
  async handlerPayload(req, res) {
    try {
      let { payload } = req.body;
      payload = JSON.parse(payload);
      let option = null;
      switch (payload.type) {
        case "block_actions":
          res.status(200).send("Ok");
          if(payload.actions[0].action_id === 'overflow-action'){
            const calendar = await MicrosoftCalendar.query().findById(payload.actions[0].block_id.split('/')[1]);
            payload.calendar = calendar;
          }
          option = await handlerBlocksActions(payload, this.template);
          break;
        case "view_submission":
          res.status(200).send({
            "response_action": "clear"
          });
          option = await this.handlerSubmit(payload);
          break;
        case "view_closed":
          res.status(200).send({
            "response_action": "clear"
          });
          break;
        default:
          break;
      }
      if (option) await Axios(option);
    } catch (e) {
      return res.status(403).send("Error !");
    }
  }

  async chatServiceHandler(req, res, next) {
    let {
      payload = null,
      challenge = null,
      event = null,
      command = null,
    } = req.body;
    try {
      if (event) {
        return this.handlerEvent(req, res);
      } else if (command && /^\/ca$/.test(command)) {
        res.status(200).send();
        return this.handlerCommand(req, res);
      } else if (payload) {
        return this.handlerPayload(req, res);
      } else if (challenge) {
        return res.status(200).send(challenge);
      }
      return res.status(200).send(`Ok`);
    } catch (error) {
      return res.status(403).send("Error !");
    }
  }
  /**
   * handler Notifications
   * @param {object} value
   */
  handlerNotifications(value) {
    const { subscriptionId, changeType, resource } = value;
    const { showEvent } = this.template;
    switch (changeType) {
      case "updated":
        handlerUpdated(subscriptionId, resource, showEvent);
        break
      case "created":
        handlerCreated(subscriptionId, resource, showEvent);
        break
      case "deleted":
        handlerDeleted(subscriptionId, resource, showEvent);
        break
      default:
        break
    }
  }

  resourceServerHandler(req, res, next) {
    try {
      const { body = null, query = null } = req;
      if (body.value) {
        res.status(202).send("OK");
        const { idAccount = null } = JSON.parse(cryptoDecode(body.value[0].clientState));
        if (!idAccount) return;
        this.handlerNotifications(body.value[0]);
      } else if (query) {
        const { validationToken } = query;
        return res.status(200).send(validationToken);
      }
      return null;
    } catch (e) {
      return res.status(403).send("ERROR");
    }
  }

  /**
   *
   * @param {array} listCalendar
   * @param {string} idAccount
   * @param {string} idChannel
   */
  async handlerCalendars(listCalendar, idAccount, idChannel) {
    for (let i = 0, length = listCalendar.length; i < length; i++) {
      const item = listCalendar[i];
      if (item.canEdit) {
        await saveCalendar({
          id: item.id,
          name: item.name,
          address_owner: item.owner.address
        }, idAccount);
        await saveAccountCalendar({
          id_calendar: item.id,
          id_account: idAccount,
        });
        await saveChannelCalendar({
          id_calendar: item.id,
          id_channel: idChannel,
          watch: true,
        });
      }
    }
  }

  async microsoftAccess(req, res, next) {
    let { code, state } = req.query;
    try {
      const payload = decodeJWT(state);
      const result = await this.getUidToken(payload.uid);
      if (!result) return res.status(401).send("jwt expired");
      const tokens = await getToken(code);
      await this.delUidToken(result);
      const accessTokenAzure = tokens.access_token;
      const refreshTokenAzure = tokens.refresh_token;

      // Thuc hien lay tai nguyen user profile
      const profileUser = await getProfileUser(accessTokenAzure);

      // Thêm đối tượng microsoftAccount và bảng microsoft_account
      await saveUserProfile(profileUser, refreshTokenAzure, accessTokenAzure);

      // Thêm channelvào bảng channels
      await saveInfoChannel(payload.idChannel);

      // Thuc hien lay tai nguyen list calendars
      const allData = await getListCalendar(profileUser.id);
      await this.handlerCalendars(
        allData.value,
        profileUser.id,
        payload.idChannel
      );

      return res.send("Successful !");
    } catch (e) {
      return res.send("Login Error !");
    }
  }
  /**
 * custom customRepeat
 * @param {Object} view
 */
  _customRepeat(view) {
    view.blocks[9].element.options[0].value = "nomal";
    view.blocks[9].element.options[1].value = "daily";
    view.blocks[9].element.options[2].value = "weekly";
    view.blocks[9].element.options[3].value = "absoluteMonthly";
    view.blocks[9].element.initial_option.value = "nomal";
  }

}


module.exports = SlackMicrosoft;

(async function () {
  const pipeline = new SlackMicrosoft(process.argv[2], {
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
  pipeline.app.get("/auth/microsoft", pipeline.microsoftAccess);
  pipeline._customRepeat(pipeline.template.addEvent);
  AxiosConfig();
})();
