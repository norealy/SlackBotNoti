const logger = (app, personality, logModel) => {

  const log = (request, response, errorMessage, requestStart) => {
    const {headers, httpVersion, method, url} = request;
    const {statusCode} = response;
    const processingTime = new Date() - requestStart;

    const newLog = new logModel({
      headers: JSON.stringify(headers),
      requestStart,
      personality,
      method,
      url,
      statusCode,
      httpVersion,
      processingTime
    });

    newLog.save(function (err) {
      if (err) return console.log('save log db fail: ', err);
    });
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
