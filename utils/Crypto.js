const Env = require("./Env");
const jws = require("jws");
const crypto = require('crypto');
const cryptoSecret = Env.getOrFail("CRYPTO_SECRET");
const IV = Env.getOrFail("CRYPTO_IV"); // phai la 16 ky tu

/**
 * Tao jwt
 * @param {object} payload
 * @returns {string} JWT
 *
 */
const createJWT = (payload) => {
  const {exp = null} = payload;
  if (!exp) {
    payload.exp = Math.floor(new Date()) + (Env.getOrFail("JWT_DURATION") / 1000);
  }
  const jwt = jws.sign({
    header: {alg: Env.getOrFail("JWT_ALG"), typ: "JWT"},
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
const decodeJWT = (token) => {
  const verified = jws.verify(
    token,
    Env.getOrFail("JWT_ALG"),
    Env.getOrFail("JWT_KEY")
  );
  if (!verified) return false;
  const jwsData = jws.decode(token);
  const payload = jwsData.payload;
  const clockTimestamp = Math.floor(new Date() / 1000);
  if (clockTimestamp >= payload.exp) {
    const error = new Error("jwt expired");
    error.code = "TokenExpiredError";
    throw error
  }
  return payload;
};

/**
 * encode
 * @param {string} value
 * @returns {string} encode
 */
function cryptoEncode(value) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(cryptoSecret), IV);
  let encrypted = cipher.update(value);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex')
}

/**
 * decode
 * @param {string} encryptedData
 * @returns {string} data
 */
function cryptoDecode(encryptedData) {
  let encryptedText = Buffer.from(encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cryptoSecret), IV);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  createJWT,
  decodeJWT,
  cryptoEncode,
  cryptoDecode
};
