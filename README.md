<<<<<<< HEAD
# README #

# Elevator Hackathon Site #

Site is built on the MEAN stack.  All client code is in client folder, all server code is in server folder.  To dev:

1. get code
2. "npm update"
3.  run "gulp server"

I think the best way to deploy would simply have forever or similar tool run app.js in the server folder.  

If all tests pass, create a team and upload the valid.json and invalid.json files to verify all services are working correctly.

## Database ##

The database access is through Mongoose.  Models are at server/model.  The data model is very simple:

* Teams (team name & password)
* Challenge (stores the challenge JSON to score against)
* TeamScore (stores the results of a teams submittal.  Details are not scored, just the number of stops and average wait time

The actual connection handling is at server/repository/database.js.  This is required at startup and handles subsequent Mongoose data access.  The models are registered as well.

## Security ##

The site is served over https with a self signed cert.  This isn't the best user experience but should suffice.  The cert and key are at server/security.

## API ##

There are three routers on the server side that comprise the API.  UploadRouter, LeaderboardRouter, and SecurityRouter.  These expose methods to handle upload (Multer), validation (see services/validationService), and scoring (see services/scoringService).
=======
# dbs-elevators
>>>>>>> d96b2633b4df712bb6b4a876119549186765f98d
