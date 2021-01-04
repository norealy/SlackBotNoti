const dotenv = require('dotenv');
const express = require('express');
const app = express();

dotenv.config();

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
	res.send('Hello World!')
});

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`)
});
