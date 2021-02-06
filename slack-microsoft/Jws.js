const Env = require("../utils/Env");
const jws = require("jws");
/**
 *
 * @param {*} idChannel
 * @param {*} idUser
 */
const createJWS = (idChannel, idUser) => {
	const iat = Math.floor(new Date());
	const exp = iat + Env.resourceServerGet("DURATION_STATE");
	const jwsEncode = jws.sign({
		header: { alg: Env.resourceServerGet("ALG"), typ: "JWT" },
		payload: { idChannel, idUser, iat, exp },
		secret: Env.resourceServerGet("SECRET_STATE"),
	});
	return jwsEncode;
};
/**
 *
 * @param jwsToken
 * @returns {Promise<boolean|*|SourceMapPayload>}
 */
const decodeJWS = async (jwsToken) => {
	const verified = await jws.verify(jwsToken, Env.resourceServerGet("ALG"), Env.resourceServerGet("SECRET_STATE"));
        if (!verified) return false
        const jwsData = jws.decode(jwsToken);
        const payload = jwsData.payload
        return payload;
};

module.exports = {
  createJWS,
  decodeJWS,
}
