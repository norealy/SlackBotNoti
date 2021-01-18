const express = require('express');
const router = express.Router();
const Event = require('../controllers/Event.Controller');

router.get('/',Event.getAll);

router.get('/:id',Event.getById);

router.get('/calendar/:id',Event.getEventInCalendar);

router.post('/create',Event.addEvent);

router.patch('/edit/:id',Event.editEvent);

router.delete('/delete/:id',Event.deleteEvent);

module.exports = router