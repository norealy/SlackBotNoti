const Env = require("./Env");
const jws = require("jws");

const createJWS = (idChannel, idMessage) => {
	const iat = Math.floor(new Date());
	const exp = iat + Env.resourceServerGet("DURATION_STATE");
	const jwsEncode = jws.sign({
		header: { alg: Env.resourceServerGet("ALG"), typ: "JWT" },
		payload: { idChannel, idMessage, iat, exp },
		secret: Env.resourceServerGet("SECRET_STATE"),
	});
	return jwsEncode;
};

const decodeJWS = async (jwsToken) => {
	const verified = await jws.verify(jwsToken, Env.resourceServerGet("ALG"), Env.resourceServerGet("SECRET_STATE"));
        if (!verified) return res.status(401).send({
            code: "E_INVALID_JWT_ACCESS_TOKEN",
            message: `Invalid access token `
        });
        const jwsData = jws.decode(jwsToken);
        const payload = jwsData.payload
        return payload;
};

module.exports = {
  createJWS,
  decodeJWS,
}
