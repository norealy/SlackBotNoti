const Env = require("../../utils/Env");
const jws = require("jws");
/**
 * Tao jwt
 * @param {string} idChannel
 * @param {string} idUser
 * @returns {string} JWT
 */
const createJWS = (idChannel, idUser) => {
	const iat = Math.floor(new Date());
	const exp = iat + (Env.getOrFail("JWT_DURATION")/100);
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

module.exports = {
	createJWS,
	decodeJWS,
};
