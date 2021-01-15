const Redis = require('redis');

class RedisClient {
	constructor(config){
		this.redis = Redis.createClient(config);
		this.redis.on("connect", this.connectSuccess);
		this.redis.on("error", this.connectError);
	};

	connectSuccess() {
		console.log("redis connect success");
	}

	connectError(e) {
		const err = new Error(`E_CONNECT_REDIS: ${e.message}`);
		err.code = 'E_CONNECT_REDIS';
		throw err
	}

	/**
	 * Close connect redis DB
	 * @return {void}
	 */
	close(){
		this.redis.off("connect", this.connectSuccess);
		this.redis.off("error", this.connectError);
		this.redis.quit();
	};

	/**
	 * Get the RedisClient object
	 * @return {RedisClient}
	 */
	getInstance() {
		return this.redis
	}
}

let instance = null;
const singleton = (config) => {
	if(!instance)
		instance = new RedisClient(config);
	return instance
}

module.exports = singleton;
