// single point to connect to mongoose called by app.js
// bundles all models
// data access further layered in /dataaccess

// Bring Mongoose into the app 
var mongoose = require('mongoose');

// Build the connection string 
var dbURI = 'mongodb://localhost:27017/dbsChallenge';

var options = {
user: "dbsChallengeUser",
pass: "dbs1!"
};

// Create the database connection 
mongoose.connect(dbURI);

// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

require('./../models/arrival');
require('./../models/teamScore');
require('./../models/challenge');
require('./../models/team');