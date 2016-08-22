'use strict';

var BluebirdPromise = require('bluebird');
var logger = require('../logging/logger');
var repositoryFactory = require('../repository/repositoryFactory');
var jwt = require('jwt-simple');
var express = require('express');
var app = express();
var _ = require('underscore');
var tokens = [];

app.set('jwtTokenSecret', '123456ABCDEF');

var securityService = function () {

    function requiresAuthentication(request, response, next) {
        console.log(request.headers);
        if (request.headers.accesstoken) {
            var token = request.headers.accesstoken;
            if (_.where(tokens, token).length > 0) {
                var decodedToken = jwt.decode(token, app.get('jwtTokenSecret'));
                if (new Date(decodedToken.expires) > new Date()) {
                    next();
                    return;
                } else {
                    removeFromTokens();
                    response.status(401).send('Your session is expired');
                }
            }
        }
        response.end(401, 'No access token found in the request');
    }

    function removeFromTokens(token) {
        for (var counter = 0; counter < tokens.length; counter++) {
            if (tokens[counter] === token) {
                tokens.splice(counter, 1);
                break;
            }
        }
    }

    function getToken(userName) {
        var expires = new Date();
        expires.setDate((new Date()).getDate() + 5);
        var token = jwt.encode({
            userName: userName,
            expires: expires
        }, app.get('jwtTokenSecret'));

        tokens.push(token);
        return token;
    }

    var logout = function (token) {
        return new BluebirdPromise(function (resolve, reject) {
            try {
                removeFromTokens(token);
                resolve();
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    var login = function (userName, password) {
        return new BluebirdPromise(function (resolve, reject) {

            try {
                repositoryFactory.team.getTeam(userName, password)
                    .then(function (team) {
                        if (team && team.length > 0) {
                            resolve(getToken(team));
                        }
                        else {
                            resolve(null);
                        }
                    })
                    .catch(function (error) {
                        logger.error(error);
                        reject(error);
                    });
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    var createLogin = function (userName, password, teamMembers) {
        return new BluebirdPromise(function (resolve, reject) {

            try {
                repositoryFactory.team.insertTeam(userName, password, teamMembers)
                    .then(function (team) {
                        resolve(team);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            }
            catch (error) {
                reject(error);
            }
        });
    };

    return {
        login: login,
        logout: logout,
        createLogin: createLogin
    };
};

module.exports = securityService;