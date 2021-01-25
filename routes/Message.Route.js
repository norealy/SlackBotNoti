const express = require('express');
const router = express.Router();
const Message = require('../controllers/Message.Controller');

router.get('/history/:id',Message.getHistory);

router.post('/create',Message.createMessage);

router.post('/add-Cal-Chanel',Message.addCalendarsToChannel);

router.patch('/update',Message.updateMessage);

router.delete('/delete',Message.deleteMessage);

module.exports = router