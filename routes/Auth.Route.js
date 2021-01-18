const express = require('express');
const router = express.Router();
const Auth = require('../controllers/Auth.Controller');

router.post('/code',Auth.setAccessTokenToCookie);

router.get('/microsoft',Auth.sendCode);

module.exports = router