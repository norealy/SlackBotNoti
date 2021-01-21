require('dotenv').config();
const Express = require('express');
const knex = require("knex");
const { Model } = require('objection');
const Path = require('path');
const Fs = require('fs-extra');
const BodyParser = require('body-parser');
const _ = require("lodash");
const Env = require('../utils/Env');

class BaseServer {
	/**
	 * constructor BaseServer class
	 * @param {string} instanceId
	 * @param {object} opt
	 */
  constructor(instanceId, opt) {
		const args  = instanceId.split("-");

		this.app = Express();
		this.instanceId = instanceId;
		this.chatService = args[0];
		this.resourceServer = args[1];

    this.config = typeof opt.config === "object" ? opt.config : {};

		this.watchRequestHandler = this.watchRequestHandler.bind(this);
		this.watchResponseHandler = this.watchResponseHandler.bind(this);
		this.pushResponseHandler = this.pushResponseHandler.bind(this);

    this.requestHandler = {
      watchRequest: this.watchRequestHandler,
      watchResponse: this.watchResponseHandler,
      pushResponse: this.pushResponseHandler,
    }
  }

	/**
	 * Read config file from config folder(either depending on the service you want to run)
	 * @param fileName
	 * @returns {Promise<unknown>}
	 */
  getConfig(fileName) {
    return new Promise((resolve, reject) => {
      Fs.readJson(Path.join(this.config.path, fileName), (err, text) => {
        if (err) {
          reject(err);
        } else {
          resolve(text);
        }
      });
    });
  }

	/**
	 * Load config from file in config folder(either depending on the service you want to run)
	 * @returns {Promise<void>}
	 */
  async loadConfig() {
    try{
      const fileName = Path.join(this.instanceId + '.json');
      this.config.instanceEnv = await this.getConfig(fileName);
    } catch (err) {
			throw new Error(`E_LOAD_CONFIG: ${err.message}`)
    }
  }

	/**
	 * Check instance environment variables and initialize the environment object
	 * @returns {void}
	 */
	configEnv() {
		const {instanceEnv} = this.config;
		if(!instanceEnv.server
			|| typeof instanceEnv.server !== "object"
			|| _.isArray(instanceEnv.server)) {
			throw new Error(`E_CONFIG_ENVIRONMENT: The server object does not exist in the config
			 file or it is not an object`);
		}
		if(!instanceEnv.chatService
			|| typeof instanceEnv.chatService !== "object"
			|| _.isArray(instanceEnv.chatService)) {
			throw new Error(`E_CONFIG_ENVIRONMENT: The chatService object does not exist in the
			config file or it is not an object`);
		}
		if(!instanceEnv.resourceServer
			|| typeof instanceEnv.resourceServer !== "object"
			|| _.isArray(instanceEnv.resourceServer)) {
			throw new Error(`E_CONFIG_ENVIRONMENT: The resourceServer object does not exist in the
			config file or it is not an object`);
		}
		Env.setConfig(instanceEnv);
	}

  requestHealthCheck(req, res, next) {
    try {
      return res.status(200).send({"pong":"OK"});
    } catch (e) {
      return res.status(400);
    }
  }

  watchRequestHandler(req, res, next) {
    return res.status(200).send("OK");
  }

  watchResponseHandler(req, res, next) {
    return res.status(200).send("OK");
  }

  pushResponseHandler(req, res, next) {
    return res.status(200).send("OK");
  }

  async init() {
    await this.loadConfig();
		this.configEnv();

    require('./utils/logger')(this.app, this.instanceId);
		require('./utils/Axios')();
		const configMysql = require('./utils/mysql/Database')(__dirname + '/utils/mysql');
		// connection Database mysql
		knex(configMysql);
		Model.knex(knex);

    this.app.disable('x-powered-by');
		this.app.use(BodyParser.urlencoded({extended: true, limit: '2mb'}));
		this.app.use(BodyParser.json({ limit: '2mb' }));

    this.app.get('/health-check', this.requestHealthCheck);
    this.app.post('/watch/request-handling', this.requestHandler.watchRequest);
    this.app.post('/watch/response-handling', this.requestHandler.watchResponse);
    this.app.post('/push/response-handling', this.requestHandler.pushResponse);

    this.app.listen(Env.serverGOF("PORT"), () => {
      console.log('%s listening at %s', this.instanceId, Env.serverGOF("PORT"));
    });
  }

}

module.exports = BaseServer;
