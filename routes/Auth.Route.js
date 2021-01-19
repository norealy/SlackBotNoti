const express = require('express');
const router = express.Router();
const Auth = require('../controllers/Auth.Controller');

router.post('/code',Auth.setAccessToken);

router.get('/slack',Auth.sendCode);

module.exports = router