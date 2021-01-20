const express = require('express');
const router = express.Router();
const Channel = require('../controllers/Channel.Controller');

router.get('/list',Channel.getAll);

router.post('/info',Channel.getInfo);

router.post('/create',Channel.addChannel);

module.exports = router