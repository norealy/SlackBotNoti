require('dotenv').config();
const Express = require('express');
const knex = require("knex");
const { Model } = require('objection');
const Path = require('path');
const Fs = require('fs-extra');
const BodyParser = require('body-parser');
const _ = require("lodash");
const Env = require('../utils/Env');
const Redis = require('../utils/redis');

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

		this.chatServiceHandler = this.chatServiceHandler.bind(this);
		this.sendCode = this.sendCode.bind(this);
		this.setAccessToken = this.setAccessToken.bind(this);
		this.resourceServerHandler = this.resourceServerHandler.bind(this);
		this.pushMessageHandler = this.pushMessageHandler.bind(this);

    this.requestHandler = {
			watchChatService: this.chatServiceHandler,
			watchSendCode: this.sendCode,
			watchSetAccessToken: this.setAccessToken,
      watchResourceServer: this.resourceServerHandler,
      pushMessage: this.pushMessageHandler,
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
	 * @return {Promise<unknown>}
	 */
  loadConfig() {
    try{
      const fileName = Path.join(this.instanceId + '.json');
      return this.getConfig(fileName)
    } catch (err) {
			throw new Error(`E_LOAD_CONFIG: ${err.message}`)
    }
  }

	/**
	 * Check instance environment variables and initialize the environment object
	 * @param {object} instanceEnv
	 * @returns {void}
	 */
	configEnv(instanceEnv) {
		const message = "object does not exist in the config file or it is not an object"
		if(!instanceEnv.server
			|| typeof instanceEnv.server !== "object"
			|| _.isArray(instanceEnv.server)) {
			throw new Error(`E_CONFIG_ENVIRONMENT: The server ${message}`);
		}
		if(!instanceEnv.chatService
			|| typeof instanceEnv.chatService !== "object"
			|| _.isArray(instanceEnv.chatService)) {
			throw new Error(`E_CONFIG_ENVIRONMENT: The chatService ${message}`);
		}
		if(!instanceEnv.resourceServer
			|| typeof instanceEnv.resourceServer !== "object"
			|| _.isArray(instanceEnv.resourceServer)) {
			throw new Error(`E_CONFIG_ENVIRONMENT: The resourceServer ${message}`);
		}
		try {
			Env.setConfig(instanceEnv);
		} catch (e){
			throw e;
		}
	}

	/**
	 * Config mysql database connection
	 * @return {Promise<unknown>}
	 */
	configMySQL() {
		return new Promise((resolve, reject) => {
			const configMysql = require('./utils/mysql/Database')(Env.appRoot);
			const mysql = knex(configMysql);
			Model.knex(mysql);
			mysql.raw("SELECT VERSION()")
				.then(() => {
					return resolve(1)
				})
				.catch((err) => {
					const code ="E_ACCESS_MYSQL_ERROR";
					const message = err.sqlMessage ? err.sqlMessage : 'Access to mysql database denied';
					const error = new Error(`${code}: ${message}`);
					error.code = code;
					reject(error)
				})
		})
	}

	configRedis(){
		return new Promise((resolve, reject) => {
			const connectSuccess = () => {
				console.log("redis connect success");
				resolve(1)
			};

			const connectError = (e) => {
				const err = new Error(`E_CONNECT_REDIS: ${e.message}`);
				err.code = 'E_CONNECT_REDIS';
				Redis.close(connectSuccess, connectError);
				reject(err)
			};

			const option = {
				host: Env.getOrFail("REDIS_HOST"),
				port: Env.getOrFail("REDIS_PORT"),
			};

			Redis.setConfig(option, connectSuccess, connectError);
		})
	}

  healthCheckHandler(req, res, next) {
    try {
      return res.status(200).send({"pong":"OK"});
    } catch (e) {
      return res.status(400);
    }
  }

  chatServiceHandler(req, res, next) {
    return res.status(200).send("OK");
  }
sendCode(req,res, next){
		return res.status(200).send("OK")
}
	watchSetAccessToken(req,res, next){
		return res.status(200).send("OK")
	}
  resourceServerHandler(req, res, next) {
    return res.status(200).send("OK");
  }

	pushMessageHandler(req, res, next) {
    return res.status(200).send("OK");
  }

  async init() {
		let instanceEnv = await this.loadConfig();
		this.configEnv(instanceEnv);

    require('./utils/logger')(this.app, this.instanceId);
		require('./utils/Axios');

		await this.configMySQL();
		await this.configRedis();

    this.app.disable('x-powered-by');
		this.app.use(BodyParser.urlencoded({extended: true, limit: '2mb'}));
		this.app.use(BodyParser.json({ limit: '2mb' }));

    this.app.get('/health-check', this.healthCheckHandler);
    this.app.post('/watch/chat-service', this.requestHandler.watchChatService);
    this.app.get('/watch-send-code',this.requestHandler.watchSendCode)
		this.app.post('/watch-set-access-token', this.requestHandler.watchSetAccessToken);
    this.app.post('/watch/resource-server', this.requestHandler.watchResourceServer);
    this.app.post('/push/message', this.requestHandler.pushMessage);

    this.app.listen(Env.serverGOF("PORT"), () => {
      console.log('%s listening at %s', this.instanceId, Env.serverGOF("PORT"));
    });
  }

}

module.exports = BaseServer;
