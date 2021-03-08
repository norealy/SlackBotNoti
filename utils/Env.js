require('dotenv').config();
const _ = require('lodash');

/**
 * Manages the application environment variables by
 * reading the `config` folder and `process.env` from the project root.
 */
class Env {
  /**
   * constructor Env class
   */
  constructor() {
    this.server = "";
    this.chatService = "";
    this.resourceServer = "";
    this.appRoot = this.get('PWD', null)
      || this.get('INIT_CWD', null)
      || process.cwd();
  }

  formatBoolean(value) {
    if (/^true$/.test(value))
      return true;
    if (/^false$/.test(value))
      return false;
    return value
  }

  /**
   * Get value for a given key from the `process.env`
   * object.
   * @method get
   * @param  {String} key
   * @param  {*} [defaultValue = null]
   * @return {*}
   */
  get(key, defaultValue = null) {
    return this.formatBoolean(_.get(process.env, key, defaultValue))
  }

  /**
   * Get value for a given key from the `server`
   * object.
   * @method get
   * @param  {String} key
   * @param  {*} [defaultValue = null]
   * @return {*}
   */
  serverGet(key, defaultValue = null) {
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
   * Get value for a given key from the `process.env`
   * object or throw an error if the key does not exist.
   * @method serveGetOrFail
   * @param  {String} key
   * @return {*}
   */
  getOrFail(key) {
    const val = _.get(process.env, key);

    if (_.isUndefined(val)) {
      const CODE = "E_MISSING_ENV_KEY";
      const err = new Error(`${CODE}: Make sure to define environment variable ${key} of server.`);
      err.code = CODE;
      throw err
    }

    return this.formatBoolean(val)
  }

  /**
   * Get value for a given key from the `server`
   * object or throw an error if the key does not exist.
   * @method serveGetOrFail
   * @param  {String} key
   * @return {*}
   */
  serverGOF(key) {
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

  /**
   * Env configuration settings
   * @param {object} server
   * @param {object} chatService
   * @param {object} resourceServer
   * @return {error|void}
   */
  setConfig({server = {}, chatService = {}, resourceServer = {}}) {
    if (this.server || this.chatService || this.resourceServer) {
      const code = 'E_SET_ENV_VARIABLE';
      const err = new Error(`${code} Application environment variables are allowed to be declared only once`);
      err.code = code;
      throw err
    }
    this.server = server;
    this.chatService = chatService;
    this.resourceServer = resourceServer;
  }
}

module.exports = new Env();
