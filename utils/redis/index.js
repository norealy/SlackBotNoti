const Redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
  };

  /**
   * Close connect redis DB
   * @return {void}
   */
  close(callbackSuccess, callbackError) {
    this.client.off("connect", callbackSuccess);
    this.client.off("error", callbackError);
    this.client.quit();
  };

  /**
   * RedisClient configuration settings
   * @return {void}
   */
  setConfig(option, callbackSuccess, callbackError) {
    if (this.client) {
      const code = 'E_CONFIG_REDIS_CLIENT';
      const err = new Error(`${code} redisClient configuration is only allowed to be declared once`);
      err.code = code;
      throw err
    }
    this.client = Redis.createClient(option);
    this.client.on("connect", callbackSuccess);
    this.client.on("error", callbackError);
  }
}

module.exports = new RedisClient();
