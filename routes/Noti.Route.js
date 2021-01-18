const express = require('express');
const router = express.Router();
const Notification = require('../controllers/Notification.Controller');

router.get('/',Notification.getAll);

router.get('/:id',Notification.getById);

router.post('/create',Notification.addNoti);

router.patch('/edit/:id',Notification.editNoti);

router.delete('/delete/:id',Notification.deleteNoti);

module.exports = router