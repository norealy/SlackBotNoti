
const iat = Math.floor(new Date() / 1000);
const exp = iat + duration;
const accessToken = jws.sign({
	header: { alg: ALG, typ: "JWT" },
	payload: { uid: user._id, iat, exp },
	secret: jwsSecret,
});
