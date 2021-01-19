const express = require('express');
const router = express.Router();
const Channel = require('../controllers/Channel.Controller');

router.get('/list',Channel.getAll);

router.post('/create',Channel.addChannel);

router.patch('/update/:id',Channel.updateChannel);

router.delete('/delete/:id',Channel.deleteChannel);

module.exports = router