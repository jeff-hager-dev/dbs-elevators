var express = require('express');
var securityRouter = express.Router();
var logger = require('../logging/logger');
var securityService = require('../services/securityService')();

securityRouter.post('/createAccount', function (request, response) {
    var userName = request.body.userName;
    var teamMembers = request.body.teamMembers;
    var password = request.body.password;

    securityService.createLogin(userName, password, teamMembers)
        .then(function (team) {
            response.status(200).send({ team: team });
        })
        .catch(function (error) {
            response.status(500).send('Error creating team');
        });
});

securityRouter.post('/login', function (request, response) {
    var userName = request.body.userName;
    var password = request.body.password;

    securityService.login(userName, password)
        .then(function (token) {
            if (token) {
                response.status(200).send({ accesstoken: token, userName: userName });
            }
            else {
                response.send(401, 'Invalid credentials');
            }
        })
        .catch(function (error) {
            response.send(401, 'Invalid credentials');
        });
});

securityRouter.post('/logout', function (request, response) {
    var token = request.headers.accesstoken;
    securityService.logout(token)
        .then(function () {
            response.status(200).send();
        })
        .catch(function (error) {
            response.status(200).send(error);
        });
});

module.exports = securityRouter;