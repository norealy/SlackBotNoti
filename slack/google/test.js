const Redis = require('../../utils/redis/index');

const x = Redis.client.set(res.id, accessTokenGoogle)
console.log(x);
