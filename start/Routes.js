const express = require('express');
const cookieParser = require('cookie-parser')
const Auth = require('../routes/Auth.Route');
const AuthCtrl = require('../controllers/Auth.Controller');
const Channel = require('../routes/Channel.Route');

function Routes(app) {
    app.use('/', express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(cookieParser())
    app.use('/auth', Auth);
    app.use('/channels', Channel);
    app.get('/slack', AuthCtrl.redirect);
}

module.exports = Routes;