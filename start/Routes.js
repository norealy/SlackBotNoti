const express = require('express');
const cookieParser = require('cookie-parser')
const Auth = require('../routes/Auth.Route');
const AuthCtrl = require('../controllers/Auth.Controller');
const Notifications = require('../controllers/Notifications.Controller');
const Channel = require('../routes/Channel.Route');
const Message = require('../routes/Message.Route');

function Routes(app) {
    app.use('/', express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(cookieParser())
    app.get('/slack', AuthCtrl.redirect);
    app.post('/notifications', Notifications.getNotis);

    app.use('/auth', Auth);
    app.use('/channels', Channel);
    app.use('/message', Message);

}

module.exports = Routes;