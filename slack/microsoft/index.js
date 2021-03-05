const BaseServer = require("../../common/BaseServer");
const Env = require("../../utils/Env");
const { cryptoDecode } = require("../../utils/Crypto");
const Template = require("../views/Template");
const { decodeJWT } = require("../../utils/Crypto");
const AxiosConfig = require('./Axios');

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
	handlerBlocksActions,
	HandlerSubmitEvent,
  handlerShowEvents,
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
	 * Xu ly cac event
	 * @param {object} event
	 * @returns {Promise}
	 */
	handlerEvent(event) {
		const {subtype, user} = event;
		const {loginResource} = this.template;
		const type = Env.chatServiceGOF("TYPE")
		if (
			subtype === type.BOT_ADD ||
			(subtype === type.CHANNEL_JOIN && user === Env.chatServiceGOF("BOT_USER"))
		)
			return sendMessageLogin(event, loginResource, this.setUidToken);
	}

	/**
	 *  Xu ly cac su kien nguoi dung goi lenh xu ly bot
	 * @param {object} body
	 * @returns {Promise}
	 */
	handlerCommand(body) {
		let text = body.text.trim();
		const result = new Promise((resolve) => resolve(body));
		switch (text) {
      case "show-events":
        return handlerShowEvents(body,this.template);
			default:
				return result;
		}
	}

	/**
	 *
	 * @param {Object} payload
	 * @param {object} res
	 */
	handlerPayload(payload, res) {
		payload = JSON.parse(payload);
		const {type = null} = payload;
		const result = new Promise((resolve) => resolve(payload));
		switch (type) {
			case "block_actions":
        res.status(200).send();
        if(payload.actions[0].action_id && payload.actions[0].action_id === "overflow-action" ){
          const { getEvent } = require('./HandlerResourceServer');
          const blockId = payload.actions[0].block_id.split('/');
          const value = payload.actions[0].selected_option.value.split('/');
          const event = await getEvent(blockId[0], value[1]);
          event.data.idCalendar = blockId[1];
          payload.eventEditDT = event.data;
          payload.idAcc = blockId[0];
        }
				return handlerBlocksActions(payload, this.template, this.timePicker);
			case "view_submission":
				HandlerSubmitEvent(payload);
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
				return res.status(200).send();
			} else if (payload) {
				await this.handlerPayload(payload, res);
				return;
			} else if (challenge) {
				return res.status(200).send(challenge);
			}
			return res.status(200).send();
		} catch (error) {
			const message = `Thank you call BOT-NOTI !
        If you want assistance please enter: /cal --help`;
			return res.status(403).send(message);
		}
	}
/**
 * handler Notifications
 * @param {object} value
 */
	handlerNotifications(value) {
		const {subscriptionId, changeType, resource} = value;
		const {showEvent} = this.template;
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
			const {body = null, query = null} = req;
			if (body.value) {
				res.status(202).send("OK");
				const {idAccount = null} = JSON.parse(cryptoDecode(body.value[0].clientState));
				if (!idAccount) return;
				this.handlerNotifications(body.value[0]);
			} else if (query) {
				const {validationToken} = query;
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
}

/**
 * custom customRepeat
 * @param {Object} viewAddEvent
 */
function customRepeat(viewEvent){
  viewEvent.blocks[9].element.options[0].value = "nomal";
  viewEvent.blocks[9].element.options[1].value = "daily";
  viewEvent.blocks[9].element.options[2].value = "weekly";
  viewEvent.blocks[9].element.options[3].value = "absoluteMonthly";
  viewEvent.blocks[9].element.initial_option.value = "nomal";
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
  customRepeat(pipeline.template.editEvent);
  AxiosConfig();
})();
