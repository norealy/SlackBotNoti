const Env = require("./Env");
const jws = require("jws");
const crypto = require('crypto');
const cryptoSecret = Env.get("CRYPTO_SECRET");
const IV = Env.get("CRYPTO_IV"); // phai la 16 ky tu

/**
 * Tao jwt
 * @param {string} idChannel
 * @param {string} idUser
 * @returns {string} JWT
 */
const createJWS = (idChannel, idUser) => {
  const iat = Math.floor(new Date());
  const exp = iat + (Env.getOrFail("JWT_DURATION") / 1000);
  const jwsEncode = jws.sign({
    header: { alg: Env.getOrFail("JWT_ALG"), typ: "JWT" },
    payload: { idChannel, idUser, iat, exp },
    secret: Env.getOrFail("JWT_KEY"),
  });
  return jwsEncode;
};
/**
 * Decode jwt tra ve payload
 * @param {string} jwsToken
 * @returns {object} payload
 */
const decodeJWS = async (jwsToken) => {
  const verified = await jws.verify(
    jwsToken,
    Env.getOrFail("JWT_ALG"),
    Env.getOrFail("JWT_KEY")
  );
  if (!verified) return false;
  const jwsData = jws.decode(jwsToken);
  const payload = jwsData.payload;
  return payload;
};

/**
 * encode
 * @param {string} idSub
 * @returns {string} Encode
 */
const cryptoEncode = function (idSub) {
  const data = {
    idSub,
    dateTime: Date.now()
  }
  let cipher = crypto.Cipher('aes-256-gcm', Buffer.from(cryptoSecret, 'hex'), IV);
  let encode = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encode += cipher.final('hex');
  return encode;
};

/**
 * decode
 * @param {string} tokenString
 * @returns {string} idSub
 */
const cryptoDecode = function (encodeString) {
  let decipher = crypto.Decipher('aes-256-gcm', Buffer.from(cryptoSecret, 'hex'), IV);
  let decodeData = decipher.update(encodeString, 'hex', 'utf8');
  decodeData = JSON.parse(decodeData);
  const { idSub = null, dateTime = null } = decodeData;
  const nowDateTime = Date.now();
  if (nowDateTime < dateTime) return null;
  return idSub;
}

module.exports = {
  createJWS,
  decodeJWS,
  cryptoEncode,
  cryptoDecode
};
