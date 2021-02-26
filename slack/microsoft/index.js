const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const {cryptoDecode} = require("../../utils/Crypto");
const Template = require("../views/Template");
const { decodeJWS } = require("./Jws");
const AxiosConfig = require('./Axios');

const {
  getToken,
  getListCalendar,
  getProfileUser,
  saveUserProfile,
  saveListCalendar,
  saveInfoChannel,
  saveMicrosoftAccountCalendar,
  saveChannelsCalendar,
} = require("./Auth");
const {
	sendMessageLogin,
	handlerSettingsMessage,
  handlerAddEvent,
  handlerBlocksActions,
  submitAddEvent,
} = require("./HandlerChatService");
const {
  handlerCreated,
  handlerUpdated,
  handlerDeleted
} = require("./HandlerResourceServer");

class SlackMicrosoft extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.microsoftAccess = this.microsoftAccess.bind(this);
		this.template = Template();
    this.timePicker = customDatetime();
	}
	/**
	 * Xu ly cac event
	 * @param {object} event
	 * @returns {Promise}
	 */
	handlerEvent(event) {
		const { subtype, user } = event;
		const { loginResource } = this.template;
		const type = Env.chatServiceGOF("TYPE")
		if (
			subtype === type.BOT_ADD ||
			(subtype === type.CHANNEL_JOIN && user === Env.chatServiceGOF("BOT_USER"))
		)
			return sendMessageLogin(event, loginResource);
	}
	/**
	 *  Xu ly cac su kien nguoi dung goi lenh xu ly bot
	 * @param {object} body
	 * @returns {Promise}
	 */
	handlerCommand(body) {
		let text = body.text.trim();
		const { systemSetting} = this.template;
		const result = new Promise((resolve) => resolve(body));
		switch (text) {
			case "settings":
				return handlerSettingsMessage(systemSetting, body);
      case "add-event":
        return handlerAddEvent(body,this.template, this.timePicker);
			default:
				return result;
		}
	}
/**
 *
 * @param {Object} payload
 * @param {object} res
 */
	handlerPayload(payload,res) {
    payload = JSON.parse(payload);
    const { type=null } = payload;
		const result = new Promise((resolve) => resolve(payload));
		switch (type) {
      case "block_actions":
        return handlerBlocksActions(payload, this.template , this.timePicker);
			case "view_submission":
         submitAddEvent(payload);
         return res.status(200).send({
          "response_action": "clear"
        });
      case "view_closed":
        return res.status(200).send({
          "response_action": "clear"
        });
			default:
				return result;
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
        await this.handlerEvent(event);
			} else if (command && /^\/cal$/.test(command)) {
        await this.handlerCommand(req.body);
        const message = `Thank you call BOT-NOTI !`;
        return res.status(200).send(message);

      } else if (payload) {
        await this.handlerPayload(payload,res);
        return ;
			} else if (challenge) {
				return res.status(200).send(challenge);
			}
      const message = `Thank you call BOT-NOTI !`;
      return res.status(200).send(message);
		} catch (error) {
			const message = `Thank you call BOT-NOTI !
        If you want assistance please enter: /cal --help`;
      return res.status(403).send(message);
    }
  }

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
        if(!idAccount) return;
        this.handlerNotifications(body.value[0]);
      }
      else if (query) {
        const { validationToken } = query;
        return res.status(200).send(validationToken);
      }
      return null;
    } catch (e) {
      return res.status(403).send("ERROR");
    }
  }

  async microsoftAccess(req, res, next) {
    const { code, state } = req.query;
    try {
      const tokens = await getToken(code, state);
      const accessTokenAzure = tokens.access_token;
      const refreshTokenAzure = tokens.refresh_token;

      // Thuc hien lay tai nguyen user profile
      const profileUser = await getProfileUser(accessTokenAzure);

      // Thêm đối tượng microsoftAccount và bảng microsoft_account
      await saveUserProfile(profileUser, refreshTokenAzure, accessTokenAzure);

      // Thuc hien lay tai nguyen list calendars
      const allData = await getListCalendar(profileUser.id);
      const allCalendar = allData.value;

      // Thêm list calendar vào bảng microsoft_calendar
      await saveListCalendar(allCalendar, profileUser.id);

      // Luu  vào bảng microsoft_account_calendar
      await saveMicrosoftAccountCalendar(profileUser.id, allCalendar);

      // Lay Decode jwt de lay ra data
      const { idChannel, idUser } = await decodeJWS(state);

      // Thêm channelvào bảng channels
      await saveInfoChannel(idChannel);

      //  Luu channels calendar vào bảng channels_calendar
      await saveChannelsCalendar(idChannel, allCalendar);

      return res.send("Successful !");
    } catch (e) {
      return res.send("Login Error !");
    }
  }
}
/**
 * Tao array Datetime
 * @returns {Array} arrayDT
 */
function customDatetime() {
  let arrayDT = [];
  let i = 0;
  while (i < 24) {
    let j = 0
    for (j = 0; j < 46; j++) {
      let datetimePicker = {
        "text": {
          "type": "plain_text",
          "text": "",
          "emoji": true
        },
        "value": ""
      }
      let textH = "";
      let textM = "";

      if (j < 10) {
        textM = `0${j}`;
      } else {
        textM = `${j}`;
      }
      if (i < 10) {
        textH = `0${i}:` + textM + "AM";
      }
      else if (i < 12) {
        textH = `${i}:` + textM + "AM";
      }
      else {
        textH = `${i}:` + textM + "PM";
      }
      datetimePicker.text.text = textH;
      datetimePicker.value = textH.slice(0, 5);
      arrayDT.push(datetimePicker);
      j += 14;
    }
    i++;
  }
  return arrayDT;
}

module.exports = SlackMicrosoft;

(async function () {
  const pipeline = new SlackMicrosoft(process.argv[2], {
    config: {
      path: process.argv[3],
      appRoot: __dirname,
    },
  });
  await Template().init();
  await pipeline.init();
  pipeline.app.get("/auth/microsoft", pipeline.microsoftAccess);
  AxiosConfig();
})();
