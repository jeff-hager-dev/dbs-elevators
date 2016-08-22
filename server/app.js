var express = require('express');
var app = express();

createAngularClient(app);
createServerApi(app);
createHttp(app);

function createAngularClient(app) {
    app.use(express.static(__dirname + '/../client/'));
}

function createServerApi(app) {
    var database = require('./repository/database');

    var uploadRouter = require('./routers/uploadRouter');
    var leaderboardRouter = require('./routers/leaderboardRouter');
    var securityRouter = require('./routers/securityRouter');

    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();

    app.use('/api/upload', uploadRouter);
    app.use('/api/leaderboard', leaderboardRouter);
    app.use('/api/security', jsonParser, securityRouter);
}

function createHttp(app) {
  var server = app.listen(82, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
}

/*
function createHttps(app) {
    var fs = require('fs');
    var https = require('https');
    var log = require('./logging/logger');
    var path = require('path');

    var privateKey = fs.readFileSync(path.join(__dirname, '/security/key.pem'), 'utf8');
    var certificate = fs.readFileSync(path.join(__dirname,'/security/cert.pem'), 'utf8');
    var credentials = { key: privateKey, cert: certificate };

    var httpsServer = https.createServer(credentials, app);

    httpsServer.listen(443, function (err) {
        log.info('running https on port 443');
    });

}    */

