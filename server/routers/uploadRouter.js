var express = require('express');
var multer = require('multer');
var uploadRouter = express.Router();
var uploadFacade = require('../facade/uploadFacade')();
var logger = require('../logging/logger');
var upload = multer({ dest: '../user/uploads/' });

uploadRouter.route('/')
    .post(upload, function (req, res) {
        uploadFacade.handleUpload(req, res)
            .then(function (submissionResult) {
                res.send(submissionResult);
            })
            .catch(function (error) {
                logger.error(error);
                res.status(500).send({ error: error });
            });
    });

module.exports = uploadRouter;