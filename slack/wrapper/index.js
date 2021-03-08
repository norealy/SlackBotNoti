const BaseServer = require('../../common/BaseServer');
const httpProxy = require('http-proxy');
const Axios = require('axios');
const Template = require("../views/Template");
const Env = require("../../utils/Env");
const {decodeJWT} = require('../../utils/Crypto');
const Express = require('express');

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
   * @param {object} req
   * @param {object} res
   * @returns {Promise}
   */
  async handlerEvent(req, res) {
    try {
      let {event, authorizations} = req.body;
      const {user_id} = authorizations[0];

      const types = Env.chatServiceGOF("TYPE");
      let option = null;

      const {loginResource} = this.template;
      switch (event.subtype) {
        case types.BOT_ADD:
        case types.APP_JOIN:
          option = handlerOptionLogin(event, loginResource, this.setUidToken);
          break;
        case types.CHANNEL_JOIN:
          if (user_id === event.user) option = handlerOptionLogin(event, loginResource, this.setUidToken);
          break;
        default:
          break;
      }

      if (option) await Axios(option)
        .then(({data}) => {if (!data.ok) throw data});

      return res.status(200).send("OK");
    } catch (e) {
      console.log("⇒⇒⇒ Handler Event ERROR: ", e);
      return res.status(204).send("ERROR");
    }
  }

  getDataServer(actions) {
    const list = Env.serverGOF("LIST");
    for (let i = 0, length = list.length; i < length; i++) {
      const {prefix} = list[i];
      for (let j = 0, length = actions.length; j < length; j++) {
        const regex = new RegExp(`^${prefix}_`);
        if (regex.test(actions[j].action_id)) return list[i]
      }
    }
  }

  async chatServiceHandler(req, res, next) {
    let {challenge, event, payload, command} = req.body;
    try {
      if (challenge) return res.status(200).send(challenge);
      if (event) return this.handlerEvent(req, res);
      if (/\/c/.test(command)) {
        if(/^go/.test(req.body.text))return proxy.web(req, res, {target: 'http://localhost:5001'});
        if(/^mi/.test(req.body.text))return proxy.web(req, res, {target: 'http://localhost:5002'});
      }
      if (payload) {
        payload = JSON.parse(payload);
        const {actions, view} = payload;
        if(view && view.callback_id){
          if(/^GO_/.test(view.callback_id))return proxy.web(req, res, {target: 'http://localhost:5001'});
          if(/^MI_/.test(view.callback_id))return proxy.web(req, res, {target: 'http://localhost:5002'});
        } else {
          const data = this.getDataServer(actions);
          return proxy.web(req, res, {target: `http://localhost:${data.PORT}`})
        }
      }
    } catch (e) {
      console.log("⇒⇒⇒ Chat Server Handler ERROR: ", e);
      return res.status(400).send("ERROR");
    }
  }

  resourceServerHandler(req, res, next) {
    try {
      let regexGO = /^x-goog/;
      for (let value in req.headers) {
        if (regexGO.test(value)) {
          return proxy.web(req, res, {target: 'http://localhost:5001'});
        }
      }
      return proxy.web(req, res, {target: 'http://localhost:5002'});
    } catch (e) {
      console.log("⇒⇒⇒ Resource Server Handler ERROR: ", e);
      return res.status(204).send("ERROR")
    }
  }

  async loginWrapper(req, res, next) {
    const {accessToken = "", redirect = ""} = req.query;
    try {
      if (!accessToken || !redirect) return res.status(400).send("Bad request");
      decodeJWT(accessToken);
      switch (redirect) {
        case "GOOGLE":
          return res.status(307).redirect(configUrlAuthGoogle(accessToken));
        case "MICROSOFT":
          return res.status(307).redirect(configUrlAuthMicrosoft(accessToken));
        default:
          return res.status(400).send("Bad request");
      }
    } catch (e) {
      console.log("⇒⇒⇒ Login Wrapper ERROR: ", e);
      return res.status(400).send("Bad request");
    }
  }

  loginGoogle(req, res, next) {
    return proxy.web(req, res, {
      target: `http://localhost:${Env.serverGOF("GOOGLE_PORT")}`
    })
  }

  loginMicrosoft(req, res, next) {
    return proxy.web(req, res, {
      target: `http://localhost:${Env.serverGOF("MICROSOFT_PORT")}`
    })
  }
}

module.exports = SlackWrapper;

(async function () {
  await Template().init(process.argv[2]);
  const wrapper = new SlackWrapper(process.argv[2], {
    config: {
      path: process.argv[3],
      appRoot: __dirname,
    },
  });
  await wrapper.init();
  wrapper.app.get("/login-wrapper", wrapper.loginWrapper);
  wrapper.app.get("/auth/google", wrapper.loginGoogle);
  wrapper.app.get("/auth/microsoft", wrapper.loginMicrosoft);
  wrapper.app.use('/public', Express.static(Env.appRoot + '/public'));
})();
