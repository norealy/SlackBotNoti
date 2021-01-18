const express = require('express');
const router = express.Router();
const Calendar = require('../controllers/Calendar.Controller');

router.get('/',Calendar.getAll);

router.get('/:id',Calendar.getById);

router.post('/create',Calendar.addCalendar);

router.patch('/edit/:id',Calendar.editCalendar);

router.delete('/delete/:id',Calendar.deleteCalendar);

module.exports = router