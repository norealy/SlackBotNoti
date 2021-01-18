const express = require('express');
const router = express.Router();
const Group = require('../controllers/Group.Controller');

router.get('/',Group.getAll);

router.get('/:id',Group.getById);

router.post('/create',Group.addGroups);

router.patch('/edit/:id',Group.editGroups);

router.delete('/delete/:id',Group.deleteGroups);

module.exports = router