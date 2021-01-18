const ENV = require('./utils/Env');
const express = require('express');
const app = express();
const port = ENV.get("PORT", 3000);

require('./start/Routes')(app);

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`)
});
module.exports = app