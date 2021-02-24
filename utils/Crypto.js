const Env = require("./Env");
const jws = require("jws");
const crypto = require('crypto');
const cryptoSecret = Env.getOrFail("CRYPTO_SECRET");
const IV = Env.getOrFail("CRYPTO_IV"); // phai la 16 ky tu

/**
 * Tao jwt
 *
  * @param {object} payload
  * @returns {string} JWT
  *
 */
const createJWT = (payload) => {
  const { exp = null } = payload;
  if (!exp) {
    payload.exp = Math.floor(new Date()) + (Env.getOrFail("JWT_DURATION") / 1000);
  }
  const jwt = jws.sign({
    header: { alg: Env.getOrFail("JWT_ALG"), typ: "JWT" },
    payload: payload,
    secret: Env.getOrFail("JWT_KEY"),
  });
  return jwt;
};
/**
 * Decode jwt tra ve payload
 * @param {string} token
 * @returns {object} payload
 */
const decodeJWT = async (token) => {
  const verified = await jws.verify(
    token,
    Env.getOrFail("JWT_ALG"),
    Env.getOrFail("JWT_KEY")
  );
  if (!verified) return false;
  const jwsData = jws.decode(token);
  const payload = jwsData.payload;
  return payload;
};

/**
 * encode
 * @param {string} value
 * @returns {string} encode
 */
const cryptoEncode = function (value) {
  let cipher = crypto.Cipher('aes-256-gcm', Buffer.from(cryptoSecret, 'hex'), IV);
  let encodeString = cipher.update(JSON.stringify(value), 'utf8', 'hex')
  encodeString += cipher.final('hex');
  return encodeString;
};

/**
 * decode
 * @param {string} encodeString
 * @returns {string} data
 */
const cryptoDecode = function (encodeString) {
  let decipher = crypto.Decipher('aes-256-gcm', Buffer.from(cryptoSecret, 'hex'), IV);
  return decipher.update(encodeString, 'hex', 'utf8');
}

module.exports = {
  createJWT,
  decodeJWT,
  cryptoEncode,
  cryptoDecode
};
