const _ = require('lodash');

/**
 * Manages the application environment variables by
 * reading the `config` folder from the project root.
 */
class Env {
	/**
	 * constructor Env class
	 * @param {object}
	 */
	constructor ({server={}, chatService={}, resourceServer={}}) {
		this.server = server;
		this.chatService = chatService;
		this.resourceServer = resourceServer;
	}

	/**
	 * Get value for a given key from the `server`
	 * object.
	 * @method get
	 * @param  {String} key
	 * @param  {*} [defaultValue = null]
	 * @return {*}
	 */
	get(key, defaultValue = null) {
		return _.get(this.server, key, defaultValue)
	}

	/**
	 * Get value for a given key from the `chatService`
	 * object.
	 * @method csGet
	 * @param  {String} key
	 * @param  {*} [defaultValue = null]
	 * @return {*}
	 */
	chatServiceGet(key, defaultValue = null) {
		return _.get(this.chatService, key, defaultValue)
	}

	/**
	 * Get value for a given key from the `resourceServer`
	 * object.
	 * @method rsGet
	 * @param  {String} key
	 * @param  {*} [defaultValue = null]
	 * @return {*}
	 */
	resourceServerGet(key, defaultValue = null) {
		return _.get(this.resourceServer, key, defaultValue)
	}

	/**
	 * Get value for a given key from the `server`
	 * object or throw an error if the key does not exist.
	 *
	 * @method serveGetOrFail
	 * @param  {String} key
	 * @return {*}
	 */
	getOrFail (key) {
		const val = _.get(this.server, key);

		if (_.isUndefined(val)) {
			const CODE = "E_MISSING_ENV_KEY";
			const err = new Error(`${CODE}: Make sure to define environment variable ${key} of server.`);
			err.code = CODE;
			throw err
		}

		return val
	}

	/**
	 * Get value for a given key from the `chatService`
	 * object or throw an error if the key does not exist.
	 *
	 * @method csGetOrFail
	 * @param  {String} key
	 * @return {*}
	 */
	chatServiceGOF(key) {
		const val = _.get(this.chatService, key);

		if (_.isUndefined(val)) {
			const CODE = "E_MISSING_ENV_KEY";
			const err = new Error(`${CODE}: Make sure to define environment variable ${key} of chatService.`);
			err.code = CODE;
			throw err
		}

		return val
	}

	/**
	 * Get value for a given key from the `resourceServer`
	 * object or throw an error if the key does not exist.
	 *
	 * @method rsGetOrFail
	 * @param  {String} key
	 * @return {*}
	 */
	resourceServerGOF(key) {
		const val = _.get(this.resourceServer, key);

		if (_.isUndefined(val)) {
			const CODE = "E_MISSING_ENV_KEY";
			const err = new Error(`${CODE}: Make sure to define environment variable ${key} of resourceServer.`);
			err.code = CODE;
			throw err
		}

		return val
	}
}

module.exports = Env;
