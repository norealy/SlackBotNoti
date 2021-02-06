const BaseServer = require('../common/BaseServer');
const Env = require('../utils/Env');
const Template = require('./views/Template');
const auth = require('./auth');
const {requestPostLogin,requestAddEvent,requestSettings,requestHome,requestAllCalendar,requestListEvent,requestButtonDelete,requestButtonUpdate,requestButtonSettings} = require('./ChatService');

class SlackGoogle extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.sendCode = this.sendCode.bind(this)
		this.getAccessToken = this.getAccessToken.bind(this)
		this.template = Template();
	}

	/**
	 *
	 * @param event
	 * @returns {Promise<unknown>|*}
	 */
	handlerEvent (event) {
		const {subtype, user} = event
		const botId = Env.chatServiceGOF("USER_BOT")
		const {loginResource} = this.template
		const promise = new Promise(resolve => resolve(event));
		switch (subtype){
			case Env.chatServiceGOF("BOT_ADD"):
				return requestPostLogin(event, loginResource);
			case  Env.chatServiceGOF("APP_JOIN"):
			case  Env.chatServiceGOF("CHANNEL_JOIN"):
				if(user === botId) return requestPostLogin(event, loginResource);
				return promise;
			default:
				return promise
		}
	}
	async handlerBodyText(body){
		 const chat = body.text.split(" ")[0];
		let viewsAdd = this.template.addEvent;

		 if(chat === "home"){

			 return requestHome(body , this.template.homePage);
		 }
		 else if(chat === "add-event"){
			 viewsAdd.blocks.splice(5, 0, Template().eventTimeEnd);
			 viewsAdd.blocks.splice(5, 0, Template().eventTimeStart);

			 return requestAddEvent(body,viewsAdd);
		 }
		 else if(chat === 'settings'){

			 return requestSettings(body,this.template.systemSetting);
		 }

		 else if(chat==='all'){
			 return requestAllCalendar(body, this.template.listCalendar);
		 }
	}
	handlerPayLoad(body,payload){
		payload = JSON.parse(payload);

		if(payload.type === 'block_actions'){
			 if(payload.actions[0].action_id==='buttonSubmit') {
				return requestListEvent( body, this.template.listEvent, payload)
			}
			else if(payload.actions[0].action_id === "buttonDelete"){
			return requestButtonDelete(this.template.deleteEvent,payload)
			}
			else if(payload.actions[0].action_id === "buttonUpdate"){
				return requestButtonUpdate(this.template.editEvent,payload)
			}
			else if(payload.actions[0].action_id === "btnSettings"){
				return requestButtonSettings(payload,this.template.systemSetting);
			}
		}
	}
	async chatServiceHandler(req, res, next) {
		let {challenge = null, event = null, payload = null} = req.body
		try {
			if (challenge) {
				return res.status(200).send(challenge);
			}
			if(event){
				console.log(event);
				await this.handlerEvent(event)
				return res.status(200).send("OK");
			}

			if (!req.body.payload) {
				 await  this.handlerBodyText(req.body)
				return res.status(200).send("OK");
			}

			 if (payload) {
				 await this.handlerPayLoad(req.body, payload);
				 return res.status(200).send("OK");
			}
		} catch (error) {
			console.log(error)
			return res.status(403).send("Error");
		}
	}
	async sendCode(req, res) {
		auth.sendCode(req, res);
	}
	async getAccessToken(req, res) {
		auth.getAccessToken(req, res);
	}
	resourceServerHandler(req, res, next) {
		try {
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
	await Template().init()
	await pipeline.init();
	pipeline.app.get('/watch-send-code', pipeline.sendCode)
	pipeline.app.post('/watch-set-access-token', pipeline.getAccessToken)
})();
