const express = require('express');
const cookieParser = require('cookie-parser')
const Auth = require('../routes/Auth.Route');
const AuthCtrl = require('../controllers/Auth.Controller');
const Events = require('../routes/Event.Route');
const Calendars = require('../routes/Calendar.Route');
const Groups = require('../routes/Group.Route');
const Notis = require('../routes/Noti.Route');
const {common} = require('../middlewares/Common');

function Routes(app) {
    app.use('/', express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(cookieParser())
    
    app.use(common);
    app.use('/auth', Auth);
    app.use('/events', Events);
    app.use('/calendars', Calendars);
    app.use('/groups', Groups);
    app.use('/notifications', Notis);
    app.get('/outlook', AuthCtrl.redirectMicrosoft);
}

module.exports = Routes;