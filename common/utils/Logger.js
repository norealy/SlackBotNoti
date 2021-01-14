const logger = (app, personality) => {

  const log = (request, response, errorMessage, requestStart, body) => {
    const {headers, httpVersion, method, url} = request;
    const {statusCode} = response;
    const processingTime = new Date() - requestStart;

    if(/dev/i.test(process.env.NODE_ENV))
    	return writeLog("debug", headers, body, requestStart, personality, method, url,
				statusCode, httpVersion, processingTime);

		return writeLog(null, headers, body, requestStart, personality, method, url, statusCode,
			httpVersion, processingTime);
  };

  const writeLog = (type, headers, body, requestStart, ...arg) => {
		if (type === "debug") {
			if (arg.length > 0) console.log(new Date(requestStart).toISOString() + " " + arg.toString().replace(/,/g, " "));
			console.log(`request headers: ${JSON.stringify(headers)}`);
			console.log(`request body: ${JSON.stringify(body)}`);
		}
  };

  app.use((request, response, next) => {
    const requestStart = Date.now();

    // ========== CLEANUP ==========
    const removeHandlers = () => {
      request.off("data", getChunk);
      request.off("end", assembleBody);
      request.off("error", getError);

      response.off("close", logClose);
      response.off("error", logError);
      response.off("finish", logFinish);
    };

    // ========== REQUEST HANLDING ==========
    let body = [];
    let requestErrorMessage = null;
    const getChunk = chunk => body.push(chunk);
    const assembleBody = () => body = Buffer.concat(body).toString();
    const getError = error => requestErrorMessage = error.message;
    request.on("data", getChunk);
    request.on("end", assembleBody);
    request.on("error", getError);

    // ========== RESPONSE HANLDING ==========
    const logClose = () => {
      removeHandlers();
      log(request, response, "Client aborted.", requestStart, body);
    };
    const logError = error => {
      removeHandlers();
      log(request, response, error.message, requestStart, body);
    };
    const logFinish = () => {
      removeHandlers();
      log(request, response, requestErrorMessage, requestStart, body);
    };
    response.on("close", logClose);
    response.on("error", logError);
    response.on("finish", logFinish);

    next()
  });
};

module.exports = logger;
