const BaseServer = require('../../common/BaseServer');
const httpProxy = require('http-proxy');
const Axios = require('axios');
const Template = require("../views/Template");
const Env = require("../../utils/Env");
const Channels = require("../../models/Channels");

const {
	handlerOptionLogin,
	configUrlAuthGoogle,
	configUrlAuthMicrosoft,
} = require("./ChatService");

const proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function (proxyReq, req) {
	if (req.body) {
		let bodyData = JSON.stringify(req.body);
		proxyReq.setHeader('Content-Type', 'application/json');
		proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
		proxyReq.write(bodyData);
	}
});

class SlackWrapper extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
		this.loginWrapper = this.loginWrapper.bind(this);
		this.template = Template();
	}

	/**
	 *
	 * @param {array} view
	 * @param {object} event
	 * @returns {Promise}
	 */
	handlerEvent(event) {
		const {subtype} = event;
		const {BOT_ADD, APP_JOIN, CHANNEL_JOIN} = Env.chatServiceGOF("TYPE");
		const {loginResource} = this.template;
		switch (subtype) {
			case BOT_ADD:
				return handlerOptionLogin(event, loginResource);
			case APP_JOIN:
				return handlerOptionLogin(event, loginResource);
			case CHANNEL_JOIN:
			default:
				return null;
		}
	}

	async chatServiceHandler(req, res, next) {
		let {challenge = null, event = null, payload = null, command = null} = req.body;
		console.log(req.body);
		try {
			if (challenge) {
				return res.status(200).send(challenge);
			}
			if (event) {
				console.log('chatServiceHandler event: ', event);
				const config = this.handlerEvent(event);
				if(config) await Axios(config);
			}
			return res.status(200).send("OK");
		} catch (e) {
			console.log("chatServiceHandler error: ", e);
			return res.status(400).send("ERROR");
		}
	}

	resourceServerHandler(req, res, next) {
		try {
			proxy.web(req, res, {
				target: 'http://localhost:5001'
			})
		} catch (e) {
			return res.status(204).send("ERROR")
		}
	}

	loginWrapper(req, res, next) {
		const {accessToken = null, redirect = null} = req.query;
		try {
			if (!accessToken || !redirect) return res.status(400).send("Bad request");
			// res.cookie(`${redirect}_SLACK`, accessToken, {
			// 	maxAge: expCookie,
			// 	httpOnly: true,
			// 	sameSite: "Strict",
			// });
			// switch (redirect) {
			// 	case "GOOGLE":
			// 		return res.status(307).redirect(configUrlAuthGoogle());
			// 	case "MICROSOFT":
			// 		return res.status(307).redirect(configUrlAuthMicrosoft());
			// 	default:
			// 		return res.status(400).send("Bad request");
			// }
			return res.status(200).send("OK");
		} catch (e) {
			return res.status(204).send("ERROR");
		}
	}

	loginGoogle(req, res, next) {
		proxy.web(req, res, {
			target: `http:localhost:${Env.resourceServerGOF("GOOGLE_PORT")}`
		})
	}

	loginMicrosoft(req, res, next) {
		proxy.web(req, res, {
			target: `http:localhost:${Env.resourceServerGOF("MICROSOFT_PORT")}`
		})
	}
}

module.exports = SlackWrapper;

(async function () {
	const wrapper = new SlackWrapper(process.argv[2], {
		config: {
			path: process.argv[3],
			appRoot: __dirname,
		},
	});
	await Template().init();
	await wrapper.init();
	wrapper.app.get("/login-wrapper", wrapper.loginWrapper);
	wrapper.app.get("/auth/google", wrapper.loginGoogle);
	wrapper.app.get("/auth/microsoft", wrapper.loginMicrosoft);
})();
